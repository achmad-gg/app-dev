# CLAUDE.md - Project Guidelines

## Project Overview
This project consists of a backend API (`article_be`) and a frontend dashboard (`article_fe`). It is a full-stack article management application.

## Environment Requirements
- **Node.js**: `^20.19.0` or `>=22.12.0` (as specified in `article_fe/package.json`)

## Development Commands
### Backend (`article_be`)
- **Run Development Server**: `cd article_be && npm run dev` (uses nodemon)
- **Install Dependencies**: `cd article_be && npm install`
- **Run Tests**: `cd article_be && npm test`
- **Run Tests (watch mode)**: `cd article_be && npm run test:watch`
- **Run Tests (coverage)**: `cd article_be && npm run test:coverage`

### Frontend (`article_fe`)
- **Run Development Server**: `cd article_fe && npm run dev` (uses Vite)
- **Build for Production**: `cd article_fe && npm run build`
- **Format Code**: `cd article_fe && npm run format` (uses Prettier)
- **Install Dependencies**: `cd article_fe && npm install`
- **Run Tests**: `cd article_fe && npm test`
- **Run Tests (watch mode)**: `cd article_fe && npm run test:watch`

## Setup & Configuration
### Environment Variables (Backend)
Required in `article_be/.env`:
- `PORT`: Server port (e.g., 3000)
- `DB_HOST`: PostgreSQL host
- `DB_USER`: PostgreSQL user
- `DB_PASS`: PostgreSQL password
- `DB_NAME`: PostgreSQL database name
- `JWT_SECRET`: Secret key for JWT signing

### Recommended IDE Setup
- **VS Code**: Install **Vue - Official** (formerly Volar) extension.
- **Chrome/Edge**: Install **Vue.js devtools**.

## Coding Standards
### General
- Use **ES6 modules** (`import`/`export`) for both backend and frontend.
- Maintain consistent indentation (2 spaces).

### Backend (`article_be`)
- **File Naming**: Use lowercase with dot separation: `name.type.js` (e.g., `article.controller.js`, `article.routes.js`).
- **Logic Placement**: Controller handles req/res, Service handles DB/business logic.
- **Structure**:
  - `src/controllers`: Request handlers.
  - `src/routes`: API route definitions.
  - `src/services`: Business logic and database interactions.
  - `src/middlewares`: Custom Express middlewares (auth, validation, etc.).
  - `src/config`: Environment and database configuration.
  - `src/utils`: Helper functions.
  - `src/tests`: Test files mirroring the `src/` structure (e.g., `src/tests/services/article.service.test.js`).
- **Database**: PostgreSQL (using `pg` client).

### Frontend (`article_fe`)
- **Framework**: Vue 3 (Composition API).
- **Styling**: Tailwind CSS.
- **State Management**: Pinia.
- **Routing**: Vue Router.
- **File Naming**: Use **PascalCase** for components and views (e.g., `ArticleCard.vue`, `ArticleList.vue`).
- **Structure**:
  - `src/components`: Reusable UI components.
  - `src/views`: Page components (organized by `admin`, `auth`, `public`, `user`).
  - `src/stores`: Pinia stores.
  - `src/api`: Axios instance and API service calls.
  - `src/composables`: Reusable Vue composables.
  - `src/layout`: Layout components.
  - `src/tests`: Test files mirroring the `src/` structure.

## API Endpoints (Prefix: `/api`)
- `/auth`: Authentication (login, register, logout).
- `/articles`: Article management.
- `/categories`: Category management.
- `/comments`: Commenting system.
- `/likes`: Like functionality.
- `/profile`: User profile management.
- `/notifications`: Notification system.
- `/admin`: Administrative tasks.

---

## Test-Driven Development (TDD)

### Philosophy
Always follow the **Red → Green → Refactor** cycle:
1. **Red**: Write a failing test that describes the desired behavior.
2. **Green**: Write the minimum code needed to make the test pass.
3. **Refactor**: Clean up the code while keeping tests passing.

Never write implementation code without a corresponding test first.

### Testing Stack
- **Backend**: [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) for API integration tests.
- **Frontend**: [Vitest](https://vitest.dev/) + [Vue Test Utils](https://test-utils.vuejs.org/) for component and composable tests.

### TDD Workflow for Every Feature
Before writing any implementation, follow these steps:

```
1. Understand the requirement
2. Write test file (e.g., article.service.test.js)
3. Run tests → confirm they FAIL (Red)
4. Write minimum implementation to pass
5. Run tests → confirm they PASS (Green)
6. Refactor code for clarity and performance
7. Run tests again → confirm still PASS
8. Commit and push (see Git Workflow below)
```

### What to Test
#### Backend
- **Services**: Unit test every public method. Mock the database (`pg`) client.
- **Controllers**: Integration test via Supertest. Test status codes, response bodies, and error handling.
- **Middlewares**: Unit test each middleware (auth, validation, error handler).
- **Routes**: Covered by controller integration tests.

#### Frontend
- **Composables**: Unit test all logic and state transitions.
- **Stores (Pinia)**: Unit test actions, getters, and state mutations.
- **Components**: Test rendering, user interactions (click, input), and emitted events.
- **API calls**: Mock with `vi.mock()` or MSW; never call real endpoints in tests.

### Test File Naming Convention
- Backend: `src/tests/**/*.test.js` (e.g., `src/tests/services/article.service.test.js`)
- Frontend: `src/tests/**/*.test.js` or co-located `*.spec.js` alongside the component.

### Example: TDD for a Service Method (Backend)

**Step 1 — Write the test first:**
```js
// src/tests/services/article.service.test.js
import { getAllArticles } from '../../services/article.service.js';
import { pool } from '../../config/db.js';

jest.mock('../../config/db.js');

describe('getAllArticles', () => {
  it('should return a list of articles', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, title: 'Test' }] });

    const result = await getAllArticles();

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('title', 'Test');
  });

  it('should return empty array when no articles exist', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await getAllArticles();

    expect(result).toEqual([]);
  });
});
```

**Step 2 — Run → Red (test fails because function doesn't exist yet).**

**Step 3 — Write minimum implementation:**
```js
// src/services/article.service.js
import { pool } from '../config/db.js';

export const getAllArticles = async () => {
  const { rows } = await pool.query('SELECT * FROM articles');
  return rows;
};
```

**Step 4 — Run → Green. Refactor if needed.**

### Example: TDD for a Component (Frontend)

**Step 1 — Write the test first:**
```js
// src/tests/components/ArticleCard.test.js
import { mount } from '@vue/test-utils';
import ArticleCard from '../../components/ArticleCard.vue';

describe('ArticleCard', () => {
  it('renders article title', () => {
    const wrapper = mount(ArticleCard, {
      props: { title: 'Hello World', author: 'John' }
    });
    expect(wrapper.text()).toContain('Hello World');
  });

  it('emits "like" event when like button is clicked', async () => {
    const wrapper = mount(ArticleCard, {
      props: { title: 'Hello World', author: 'John' }
    });
    await wrapper.find('[data-testid="like-btn"]').trigger('click');
    expect(wrapper.emitted('like')).toBeTruthy();
  });
});
```

**Step 2 — Run → Red. Step 3 — Implement component. Step 4 — Run → Green.**

### Coverage Requirements
- Aim for **≥80% code coverage** on services and composables.
- Run `npm run test:coverage` before every push to check coverage.
- Do not merge/push if coverage drops below the threshold.

---

## Git Workflow

### Core Rule
**Always push after every meaningful change.** A meaningful change is any change where tests are green and the feature/fix/refactor is complete. Never accumulate multiple unrelated changes in one commit.

### Commit Message Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

Types:
  feat     – new feature
  fix      – bug fix
  test     – adding or updating tests
  refactor – code change that neither fixes a bug nor adds a feature
  chore    – tooling, config, dependency updates
  docs     – documentation only
  style    – formatting, whitespace (no logic change)
```

Examples:
```
feat(article): add getAllArticles service with unit tests
fix(auth): resolve JWT expiry not being validated
test(comment): add integration tests for POST /api/comments
refactor(profile): extract avatar upload logic to util
```

### Push Workflow After Every Change

```bash
# 1. Run all tests — DO NOT push if any test fails
cd article_be && npm test
cd article_fe && npm test

# 2. Check coverage (optional but recommended)
cd article_be && npm run test:coverage

# 3. Stage changes
git add .

# 4. Commit with a descriptive message
git commit -m "feat(article): add pagination to article list service"

# 5. Push immediately
git push
```

### Branch Strategy
- `main` – production-ready code only. Always passing tests.
- `dev` – integration branch. Merge features here first.
- `feat/<name>` – feature branches (e.g., `feat/article-search`).
- `fix/<name>` – bug fix branches (e.g., `fix/auth-token-refresh`).

### Pull Request Rules
- Every PR must include tests for the changed code.
- All tests must pass before merging.
- Squash commits when merging feature branches into `dev`.

### Automated Pre-push Checklist (recommended)
Add this to `.git/hooks/pre-push` to prevent pushing broken code:

```bash
#!/bin/sh
echo "Running tests before push..."
cd article_be && npm test --silent
if [ $? -ne 0 ]; then
  echo "Backend tests failed. Push aborted."
  exit 1
fi
cd ../article_fe && npm test --silent
if [ $? -ne 0 ]; then
  echo "Frontend tests failed. Push aborted."
  exit 1
fi
echo "All tests passed. Pushing..."
exit 0
```

Make it executable: `chmod +x .git/hooks/pre-push`

---

## Error Handling

### BaseError Pattern (Backend)
All backend errors should use the centralized `BaseError` class hierarchy in `src/utils/BaseError.js`.

```js
import { BaseError, NotFoundError, ForbiddenError, ValidationError } from '../utils/BaseError.js';

// In controllers or services:
throw new NotFoundError('Article');       // → 404 { message: "Article not found" }
throw new ForbiddenError();               // → 403 { message: "Forbidden" }
throw new ValidationError([               // → 422 { message: "Validation failed", details: [...] }
  { field: 'title', message: 'Too short' }
]);
throw new BaseError('Custom error', 409); // → 409 { message: "Custom error" }
```

### Global Error Handler
The error handler in `app.js` automatically catches `BaseError` instances and returns structured JSON. Unknown errors return 500 with the message hidden in production (`NODE_ENV=production`).

**Rule**: Never use `res.status(xxx).json({ message })` for common error patterns. Use `throw new XxxError()` and let the global handler format the response.

---

## Request Validation

### express-validator (Backend)
Validation rules are defined in `src/middlewares/validator.js` and applied as middleware in routes.

```js
// In routes:
import { articleCreateRules, validate } from '../middlewares/validator.js';

router.post('/create', authMiddleware, articleCreateRules, validate, controller.create);
```

### Available Rule Sets
- `articleCreateRules` — title (min 5 chars), content (required), category_id (int > 0)
- `articleUpdateRules` — same as create
- `rejectRules` — reason (min 5 chars)

### Adding New Rules
1. Define rules in `validator.js` using `body()`, `param()`, or `query()` from `express-validator`.
2. Always include the `validate` middleware **after** the rules array in the route chain.
3. The `validate` middleware returns `422` with structured `{ message, details: [{ field, message }] }`.

---

## Design System & UI Standards

### CSS Design Tokens
All design tokens are defined as CSS custom properties in `main.css` under `:root`.

| Token | Purpose |
|---|---|
| `--color-primary-*` | Indigo/violet primary palette (50–700) |
| `--color-accent-*` | Warm amber accent (400–500) |
| `--color-surface` | White surface background |
| `--color-surface-muted` | Slate-50 muted background |
| `--color-border` | Default border color |
| `--color-text` | Primary text color |
| `--color-text-muted` | Secondary/muted text |
| `--shadow-sm/md/lg/xl` | Elevation shadows |
| `--radius-lg/xl/2xl` | Border radius tokens |
| `--ease-spring` | Spring easing curve |

### Typography
- **Body**: `Inter` (Google Fonts) — weights 300–700.
- **Headings**: `Playfair Display` (Google Fonts) — via `.font-heading` class.
- Fonts are loaded in `index.html` via `<link>` with `preconnect`.

### Utility Classes (defined in `main.css`)
| Class | Effect |
|---|---|
| `.glass` | White glassmorphism (blur + opacity) |
| `.glass-dark` | Dark glassmorphism |
| `.transition-smooth` | 0.3s ease transition |
| `.transition-spring` | 0.4s spring bounce transition |
| `.animate-fade-in-up` | Fade + slide up entrance |
| `.skeleton-shimmer` | Shimmer loading skeleton |

### Color Palette Rules
- **Primary actions/links**: Use `indigo-600` / `violet-600` (never plain blue).
- **Hover states on cards**: Use `hover:-translate-y-1` + `hover:shadow-xl` for lift effect.
- **Gradients**: Use `from-indigo-600 via-violet-600 to-purple-700` for hero/accent areas.
- **Category badges**: Use `text-indigo-700` on `bg-white/90 backdrop-blur-sm`.
- **Empty states**: Use `bg-indigo-50` icon containers with `text-indigo-300` icons.

### Animation Guidelines
- Stagger card animations using `:style="{ animationDelay: \`${index * 0.06}s\` }"`.
- Use `skeleton-shimmer` class for loading states (not plain `animate-pulse`).
- Keep all transitions under 500ms for responsiveness.

---

## Known Bugs Fixed (2026-04-29)

| Bug | Location | Fix |
|---|---|---|
| Duplicate `express.static('uploads')` | `app.js` lines 32 + 66 | Removed the second mount at line 66 |
| `currentAction` always null | `App.vue` | Removed unused `currentAction` variable; call `onConfirm()` directly |
| Auth token set after app mount (race condition) | `main.js` | Moved `localStorage.getItem('token')` + header setup **before** `createApp().mount()` |
| Commented-out dead code in layout | `AppLayout.vue` | Cleaned up; restored proper `min-h-screen flex flex-col` layout for sticky footer |
| No input validation on article routes | `article.routes.js` | Added `express-validator` rules + `validate` middleware |
| Generic 500 error responses hide useful info | `app.js` error handler | Added `BaseError` instance check; show `err.message` in dev mode |

---

## Performance Optimizations

### Backend
- **`compression`** middleware enabled globally in `app.js` for gzip/brotli response compression.
- **Static files**: Single `express.static('uploads')` mount with `Cache-Control: no-store` for dev.

### Frontend
- **Lazy image loading**: All `<img>` tags use `loading="lazy"`.
- **Debounced search**: Article search input uses `lodash.debounce(400ms)`.
- **Staggered rendering**: Card grid uses animation delay to avoid layout thrashing.