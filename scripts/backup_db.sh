#!/bin/bash

# Configuration
BACKUP_DIR="$(pwd)/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=7

# Load environment variables if .env exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "🐘 Starting database backup..."

# Use pg_dump. Note: DATABASE_URL is expected to be in .env
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in .env"
    exit 1
fi

FILENAME="spectr_db_$TIMESTAMP.sql"
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$FILENAME"

if [ $? -eq 0 ]; then
    echo "✅ Backup created: $FILENAME"
    # Compress the backup
    gzip "$BACKUP_DIR/$FILENAME"
    echo "📦 Compressed: $FILENAME.gz"
else
    echo "❌ Backup failed!"
    exit 1
fi

# Cleanup old backups
echo "🧹 Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "spectr_db_*.sql.gz" -mtime +$RETENTION_DAYS -exec rm {} \;

echo "🏁 Backup process complete."
