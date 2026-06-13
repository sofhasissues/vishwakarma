#!/bin/bash
set -e

mkdir -p app/{api/routes,agents,models,services,db/tables,workers,utils}

touch app/api/__init__.py
touch app/api/routes/__init__.py
touch app/api/routes/resume.py
touch app/api/routes/analysis.py
touch app/api/routes/roadmap.py
touch app/api/routes/interview.py
touch app/api/routes/tracker.py

touch app/agents/__init__.py
touch app/agents/state.py
touch app/agents/graph.py
touch app/agents/resume_parser.py
touch app/agents/market_intel.py
touch app/agents/skill_gap.py
touch app/agents/roadmap.py
touch app/agents/mock_interview.py

touch app/models/__init__.py
touch app/models/resume.py
touch app/models/job.py
touch app/models/analysis.py
touch app/models/interview.py
touch app/models/tracker.py

touch app/services/__init__.py
touch app/services/s3.py
touch app/services/scraper.py
touch app/services/notifications.py

touch app/db/__init__.py
touch app/db/session.py
touch app/db/base.py
touch app/db/tables/__init__.py
touch app/db/tables/users.py
touch app/db/tables/resumes.py
touch app/db/tables/analyses.py
touch app/db/tables/tracker.py

touch app/workers/__init__.py
touch app/workers/celery_app.py
touch app/workers/tasks.py

touch app/utils/__init__.py
touch app/utils/logger.py

touch app/__init__.py
touch app/main.py
touch app/config.py

mkdir -p alembic/versions
touch alembic/env.py
touch alembic.ini

mkdir -p tests/{agents,api,services}
touch tests/__init__.py
touch tests/agents/__init__.py
touch tests/api/__init__.py
touch tests/services/__init__.py

echo "Done. Structure:"
find app -type f | sort
