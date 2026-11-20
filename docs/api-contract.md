# Contrat d'API : Smart Study

Format JSON. Authentification : en-tête `Authorization: Bearer <JWT>` (sauf routes publiques).
Erreurs : `{ "message": "..." }` avec 400, 401, 404, 409, 502 ou 504.

## Backend (préfixe /api)

| Méthode | Route | Corps / Réponse |
|---|---|---|
| POST | /auth/register | `{name,email,password}` -> `{user,token}` |
| POST | /auth/login | `{email,password}` -> `{user,token}` |
| GET | /auth/me | -> `{user}` |
| GET | /dashboard/stats | -> `{totalCourses,totalSummaries,totalQuizzes,recentCourses[]}` |
| GET | /courses | -> `[Course]` |
| POST | /courses | `{title,subject,content}` -> `Course` |
| GET | /courses/:id | -> `Course` |
| PUT | /courses/:id | `{title,subject,content}` -> `Course` |
| DELETE | /courses/:id | -> `{message}` (suppression en cascade) |
| POST | /courses/:id/summary | -> `Summary` |
| GET | /courses/:id/summaries | -> `[Summary]` |
| GET | /summaries | -> `[Summary]` (historique) |
| POST | /courses/:id/quiz | `{numberOfQuestions}` -> `Quiz` |
| GET | /courses/:id/quizzes | -> `[Quiz]` |
| GET | /quizzes | -> `[Quiz]` (historique) |
| GET | /quizzes/:quizId | -> `Quiz` |
| POST | /quizzes/:quizId/submit | `{answers:[{questionIndex,selected}]}` -> `QuizResult` |
| GET | /quizzes/:quizId/results | -> `[QuizResult]` |
| GET | /health | -> `{status,service,database,uptime}` |

## Service IA

| Méthode | Route | Entrée | Sortie |
|---|---|---|---|
| POST | /api/ai/summarize | `{courseContent}` | `{summary}` |
| POST | /api/ai/generate-quiz | `{courseContent,numberOfQuestions}` | `{questions:[{question,options[4],correctAnswer}]}` |
| GET | /health | n/a | `{status,service,model}` |

## Modèles

- User: `{_id,name,email,createdAt}` (le mot de passe n'est jamais renvoyé)
- Course: `{_id,userId,title,subject,content,createdAt,updatedAt}`
- Summary: `{_id,userId,courseId,content,createdAt}`
- Quiz: `{_id,userId,courseId,questions:[{question,options[4],correctAnswer}],createdAt}`
- QuizResult: `{_id,userId,quizId,courseId,score,totalQuestions,answers:[{questionIndex,selected,isCorrect}],createdAt}`
