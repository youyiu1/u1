-- Compatibility entry for the old booking/order migration name.
-- The destructive v2 script was replaced. Use this idempotent script instead:
--   mysql -u root -proot neighborhood_db < backend-java-reference/sql/booking_order_notification_migration.sql

SOURCE backend-java-reference/sql/booking_order_notification_migration.sql;
