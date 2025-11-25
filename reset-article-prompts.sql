-- Reset article prompts to defaults (fixes Azure JSON requirement)
-- This will delete custom article prompts and let the system use default prompts
-- which include the required "JSON" keyword

DELETE FROM "AiPromptConfig" WHERE task = 'article';

-- After running this, the system will use default prompts from code
-- which already include "JSON" keyword in the user prompt
