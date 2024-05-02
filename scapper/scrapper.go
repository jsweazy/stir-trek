package main

import (
	"database/sql"
	"log"
	"os"
	"strings"

	"github.com/gocolly/colly"
	_ "github.com/mattn/go-sqlite3"
)

type Speaker struct {
	Name string
	URL  string
}

type Session struct {
	Time     string
	Title    string
	Link     string
	Category []string
	Room     string
	Speaker  Speaker
}

const SessionDatabase = "../sessions.db"

func main() {
	sessions := []Session{}

	c := colly.NewCollector()
	c.OnHTML("table#scheduleTable tr", func(e *colly.HTMLElement) {
		if e.Attr("class") == "scheduleTimeRow" {
			return
		}

		speaker := e.ChildText("td:nth-of-type(3)")

		if speaker == "" {
			return
		}

		session := Session{}

		session.Time = e.ChildText("td:nth-of-type(1)")
		session.Title = e.ChildText("td:nth-of-type(2)")
		session.Link = e.ChildAttr("td:nth-of-type(2) a", "href")

		catStr := e.ChildText("td:nth-of-type(4)")
		session.Category = strings.Split(catStr, ", ")
		session.Room = e.ChildText("td:nth-of-type(5)")
		session.Speaker = Speaker{
			Name: speaker,
			URL:  e.ChildAttr("td:nth-of-type(3) a", "href"),
		}
		sessions = append(sessions, session)
	})

	c.Visit("https://stirtrek.com/schedule/")

	os.Remove(SessionDatabase)

	db, err := sql.Open("sqlite3", SessionDatabase)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	createTablesStmt := `CREATE TABLE sessions (
		id integer NOT NULL PRIMARY KEY AUTOINCREMENT,
		time TEXT, 
		title TEXT, 
		link TEXT, 
		room TEXT, 
		speaker TEXT, 
		speaker_url TEXT
	);
	CREATE TABLE categories (
		id integer NOT NULL PRIMARY KEY AUTOINCREMENT,
		name TEXT
	);
	CREATE TABLE session_categories (
		session_id integer NOT NULL,
		category_id integer NOT NULL,
		FOREIGN KEY(session_id) REFERENCES sessions(id),
		FOREIGN KEY(category_id) REFERENCES categories(id)
	);
	`

	_, err = db.Exec(createTablesStmt)
	if err != nil {
		log.Printf("%q: %s\n", err, createTablesStmt)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		log.Fatal(err)
	}

	allCategories := map[string]bool{}
	catNameToId := map[string]int{}
	for _, s := range sessions {
		for _, c := range s.Category {
			allCategories[c] = true
		}
	}

	catStmt, err := tx.Prepare("INSERT INTO categories (name) VALUES (?)")
	if err != nil {
		log.Fatal(err)
	}
	defer catStmt.Close()

	for c := range allCategories {
		cat, err := catStmt.Exec(c)
		if err != nil {
			log.Fatal(err)
		}

		catId, err := cat.LastInsertId()
		if err != nil {
			log.Fatal(err)
		}
		catNameToId[c] = int(catId)
	}

	stmt, err := tx.Prepare("INSERT INTO sessions (time, title, link, room, speaker, speaker_url) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()

	catsStmt, err := tx.Prepare("INSERT INTO session_categories (session_id, category_id) VALUES (?, ?)")
	if err != nil {
		log.Fatal(err)
	}
	defer catsStmt.Close()

	for _, s := range sessions {
		sess, err := stmt.Exec(s.Time, s.Title, s.Link, s.Room, s.Speaker.Name, s.Speaker.URL)
		if err != nil {
			log.Fatal(err)
		}

		sessionId, err := sess.LastInsertId()
		if err != nil {
			log.Fatal(err)
		}

		for _, c := range s.Category {
			_, err := catsStmt.Exec(sessionId, catNameToId[c])
			if err != nil {
				log.Fatal(err)
			}
		}
	}

	err = tx.Commit()
	if err != nil {
		log.Fatal(err)
	}
}
