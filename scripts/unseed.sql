-- Removes ALL Amsta Clean test data (anything with an @amstaclean.test email). Safe to run any time.
-- Order matters: assignments reference both customers and cleaners.
delete from public.customer_assignments where waitlist_id in (select id from public.customer_waitlist where email like '%@amstaclean.test');
delete from public.customer_waitlist where email like '%@amstaclean.test';
delete from public.cleaner_applications where email like '%@amstaclean.test';
delete from public."user" where email like '%@amstaclean.test';  -- sessions and accounts are removed with the user
