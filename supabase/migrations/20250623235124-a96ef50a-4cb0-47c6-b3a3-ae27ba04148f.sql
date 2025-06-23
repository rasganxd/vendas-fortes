
-- Migration to standardize visit_days from Portuguese to English
UPDATE customers 
SET visit_days = ARRAY(
  SELECT CASE 
    WHEN unnest_val = 'segunda' THEN 'monday'
    WHEN unnest_val = 'terca' THEN 'tuesday' 
    WHEN unnest_val = 'quarta' THEN 'wednesday'
    WHEN unnest_val = 'quinta' THEN 'thursday'
    WHEN unnest_val = 'sexta' THEN 'friday'
    WHEN unnest_val = 'sabado' THEN 'saturday'
    WHEN unnest_val = 'domingo' THEN 'sunday'
    ELSE unnest_val -- Keep existing English values unchanged
  END
  FROM unnest(visit_days) AS unnest_val
)
WHERE visit_days && ARRAY['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
