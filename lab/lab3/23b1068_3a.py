from tabulate import tabulate
import psycopg2 as pg
from psycopg2 import sql
from parse import *

class PGShell:
    def __init__(self, hostname, port, database, username, password) -> None:
        self.hostname = hostname
        self.port = port
        self.database = database
        self.username = username
        self.password = password
        self.conn, self.cursor = self.connectDB()
                  
    def __del__(self) -> None:
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
            # TODO: Create database connection (conn) and cursor
            conn = pg.connect(user=self.username, password=self.password, database=self.database, port=self.port, host=self.hostname)
            cursor = conn.cursor()
            
            return conn, cursor
        except Exception as e:
            print(e)
    
    def loadSchema(self, filename):
        """
        Load SQL schema from a file.
        """
        try:
            # TODO: Read file and execute SQL
            with open(filename, 'r') as f:
                sql_script = f.read()
            self.cursor.execute(sql_script)
            self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            print(e)

    def getTables(self):
        try:
            # TODO: List of (non-system) tables from the PostgreSQL information schema
            query = "SELECT table_name FROM Information_schema.tables WHERE table_schema = 'public'"
            self.cursor.execute(query)            
            result = self.cursor.fetchall()
            print(tabulate(result, headers=["tables"], tablefmt="grid"))
        except Exception as e:
            self.conn.rollback()
            print(e)

    def printForeignKeys(self):
        try:
           #TODO: List all foreign key dependencies Outputs pairs (r, s) where r references s
            query = """
                SELECT DISTINCT
                    tc.table_name  AS referencing_table,   
                    ccu.table_name AS referenced_table     
                FROM information_schema.table_constraints tc
                JOIN information_schema.referential_constraints rc
                    ON tc.constraint_name = rc.constraint_name
                JOIN information_schema.constraint_column_usage ccu
                    ON rc.unique_constraint_name = ccu.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY';

                """

            self.cursor.execute(query)
            result = self.cursor.fetchall()
            print(tabulate(result, headers=["r", "s"], tablefmt="grid"))
        except Exception as e:
            self.conn.rollback()
            print(e)

    def print_fk_toposort(self):
        try:
            #TODO: Print all tables in topological order using recursive SQL based on foreign key dependencies
            query = """
                WITH RECURSIVE
                dep AS (
                    SELECT
                        tc.table_name  AS r,
                        ccu.table_name AS s
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.referential_constraints rc
                        ON tc.constraint_name = rc.constraint_name
                    JOIN information_schema.constraint_column_usage ccu
                        ON rc.unique_constraint_name = ccu.constraint_name
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                ),
                base AS (
                    SELECT
                        t.table_name AS rel,
                        0 AS depth
                    FROM information_schema.tables t
                    WHERE t.table_schema = 'public'
                    AND t.table_name NOT IN (SELECT r FROM dep)
                ),
                rec(rel, depth) AS (
                    SELECT rel, depth FROM base
                    UNION ALL
                    SELECT
                        d.r,
                        rec.depth + 1
                    FROM rec
                    JOIN dep d
                        ON d.s = rec.rel
                ),
                final_depth AS (
                    SELECT
                        rel,
                        MAX(depth) AS depth
                    FROM rec
                    GROUP BY rel
                )
                SELECT rel
                FROM final_depth
                ORDER BY depth, rel;
            """
            self.cursor.execute(query)
            result = self.cursor.fetchall()
            print(tabulate(result, headers=["tables"], tablefmt="grid"))
        except Exception as e:
            self.conn.rollback()
            print(e)

dbconn = None

# Command Parsing: DO NOT CHANGE ANYTHING BELOW THIS LINE
def parse_cmd(cmd):
    global dbconn
    cmd = str(cmd)

    if cmd.startswith("\\connect"):
        p = cmd.split()
        dbconn = PGShell(p[1], p[2], p[3], p[4], p[5])

    elif cmd.startswith("\\ddl"):
        dbconn.loadSchema(cmd.split()[1])

    elif cmd == "\\d":
        dbconn.getTables()

    elif cmd == "\\f":
        dbconn.printForeignKeys()

    elif cmd == "\\s":
        dbconn.print_fk_toposort()

    elif cmd == "\\q":
        exit()

    else:        
        raise Exception("Invalid Command")


def main():
    while True:
        cmd = input("pgshell# ").strip()
        parse_cmd(cmd)

if __name__ == '__main__':
    main()