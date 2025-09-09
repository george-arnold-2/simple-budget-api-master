BEGIN;
INSERT INTO categories (name)
VALUES 
('Bills'),
('Food'),
('Entertainment');

INSERT INTO transactions (venue, amount, comments, categoryId) 
VALUES 
('Safeway', 30.44, 'Dinner for the week', 2),
('Comcast', 130.19, 'Cable and internet', 1),
('Chipotle', 20.52, 'Friday night dinner', 2),
('Bon Jovi', 200.25, 'Tickets for concert', 3);

COMMIT;