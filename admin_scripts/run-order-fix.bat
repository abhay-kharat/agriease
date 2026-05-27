@echo off
echo Running Order Number Fix Migration...
set PGPASSWORD=Pass@1234
psql -U postgres -d agriease_db -f migration_add_display_order_number.sql
echo Done.
pause