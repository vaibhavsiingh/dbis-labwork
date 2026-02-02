from datetime import date
import psycopg2 as pg
from psycopg2 import sql
from tabulate import tabulate


class CalendarShell:
    def __init__(self, hostname, port, database, username, password):
        self.hostname = hostname
        self.port = port
        self.database = database
        self.username = username
        self.password = password
        self.conn, self.cursor = self.connectDB()

    def __del__(self):
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()


    def connectDB(self):
        """
        Establish a connection to PostgreSQL and return
        (connection, cursor).
        """
        try:
            conn = pg.connect(
                host=self.hostname,
                port=self.port,
                dbname=self.database,
                user=self.username,
                password=self.password
            )
            cursor = conn.cursor()
            print("Database connected succesfully!")
            return conn, cursor
        except Exception as e:
            print(f"Connection failed: {e}")
            return None, None

    # Loading the schema
    def loadSchema(self):
        """
        Load SQL schema .
        """
        try:
            # TODO: Create the schema
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS events (
                    id SERIAL PRIMARY KEY,
                    start_date DATE NOT NULL,
                    start_time TIME NOT NULL,
                    end_time TIME NOT NULL,
                    title VARCHAR(255) NOT NULL
                );
                
                CREATE TABLE IF NOT EXISTS invitations (
                    id SERIAL PRIMARY KEY,
                    event_id INTEGER NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
                );
            """)
            self.conn.commit()
            
        except Exception as e:
            self.conn.rollback()
            print(f"Schema load error: {e}")

    # Event Operations
    def addEvent(self, start_date, start_time, end_time, title):
        """
        Insert a new calendar event.
        """
        try:
            # TODO: Insert into events table
            query = sql.SQL("INSERT INTO events (start_date, start_time, end_time, title) VALUES (%s, %s, %s, %s)")
            self.cursor.execute(query, (start_date, start_time, end_time, title))
            self.conn.commit()
            
        except Exception as e:
            self.conn.rollback()
            print(f"Add event failed: {e}")

    def listAllEvents(self):
        """
        List all events in the database.
        """
        try:
            # TODO: Fetch all events
            query = sql.SQL("SELECT * FROM events")
            self.cursor.execute(query)
            rows = self.cursor.fetchall()            
            headers = ["ID", "start_date", "start_time", "end_time", "title"]
            print(tabulate(rows, headers=headers, tablefmt="grid"))
        except Exception as e:
            self.conn.rollback()
            print(e)

    def listTodayEvents(self):
        """
        List events for the current date.
        """
        try:
            # TODO: Fetch events with start_date = today
            query = sql.SQL("SELECT * FROM events WHERE start_date = %s")
            self.cursor.execute(query, (date.today(),))
            rows = self.cursor.fetchall()            
            headers = ["ID", "start_date", "start_time", "end_time", "title"]
            print(tabulate(rows, headers=headers, tablefmt="grid"))
        except Exception as e:
            self.conn.rollback()
            print(e)

    def deleteEvent(self, event_id):
        """
        Delete event by ID.
        """
        try:
            # TODO: Delete event
            query = sql.SQL("DELETE FROM events WHERE id = %s")
            self.cursor.execute(query, (event_id,))
            self.conn.commit()
            pass
        except Exception as e:
            self.conn.rollback()
            print(e)

    # Invitation operations
    def invite(self, event_id, email):
        """
        Add an invitation for an event.
        """
        try:
            # TODO: Insert into invitations table
            query = sql.SQL("INSERT INTO invitations (event_id, email) VALUES (%s, %s)")
            self.cursor.execute(query, (event_id, email))
            self.conn.commit()
            
        except Exception as e:
            self.conn.rollback()
            print(e)

    def dropInvite(self, event_id, email):
        """
        Remove an invitation from an event.
        """
        try:
            # TODO: Delete from invitations table
            query = sql.SQL("DELETE FROM invitations WHERE event_id = %s AND email = %s")
            self.cursor.execute(query, (event_id, email))
            self.conn.commit()
            
        except Exception as e:
            self.conn.rollback()
            print(e)


myCalendar = None


# Command Parsing: DO NOT CHANGE ANYTHING BELOW THIS LINE
def parse_cmd(cmd):
    global myCalendar

    if cmd.startswith("connect"):
        params = cmd.split()
        if len(params) != 6:
            raise Exception("Usage: connect host port db user password")
        myCalendar = CalendarShell(
            params[1], params[2], params[3], params[4], params[5]
        )

    elif cmd == "ddl":
        if myCalendar is None:
            raise Exception("Not connected")
        myCalendar.loadSchema()

    elif cmd.startswith("add"):
        if myCalendar is None:
            raise Exception("Not connected")
        tokens = cmd.split()
        if len(tokens) < 5:
            raise Exception("Invalid add command")
        start_date = tokens[1]
        start_time = tokens[2]
        end_time = tokens[3]
        title = " ".join(tokens[4:])
        myCalendar.addEvent(start_date, start_time, end_time, title)

    elif cmd == "list all":
        if myCalendar is None:
            raise Exception("Not connected")
        myCalendar.listAllEvents()

    elif cmd == "list today":
        if myCalendar is None:
            raise Exception("Not connected")
        myCalendar.listTodayEvents()

    elif cmd.startswith("delete"):
        if myCalendar is None:
            raise Exception("Not connected")
        tokens = cmd.split()
        if len(tokens) != 2:
            raise Exception("Usage: delete <ID>")
        myCalendar.deleteEvent(int(tokens[1]))

    elif cmd.startswith("invite"):
        if myCalendar is None:
            raise Exception("Not connected")
        tokens = cmd.split()
        if len(tokens) != 3:
            raise Exception("Usage: invite <ID> <email>")
        myCalendar.invite(int(tokens[1]), tokens[2])

    elif cmd.startswith("drop"):
        if myCalendar is None:
            raise Exception("Not connected")
        tokens = cmd.split()
        if len(tokens) != 3:
            raise Exception("Usage: drop <ID> <email>")
        myCalendar.dropInvite(int(tokens[1]), tokens[2])

    elif cmd == "quit":
        if myCalendar is not None:
            del myCalendar
        exit()

    else:
        raise Exception("Invalid command")


def main():
    while True:
        cmd = input("calendar# ").strip()
        try:
            parse_cmd(cmd)
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    main()