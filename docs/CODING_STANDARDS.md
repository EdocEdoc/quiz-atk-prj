# 🧩 Coding Standards and Best Practices

## 1. 📘 Introduction
This document defines the coding standards and best practices for the **quiz-atk-prj** codebase.  
Its goal is to ensure **consistency**, **readability**, and **maintainability** across all contributions.

---

## 2. 💡 General Guidelines
- Follow **consistent naming conventions**, **indentation**, and **code formatting**.
- Code should be **self-explanatory** and **modular**.
- Avoid duplication (DRY principle: *Don’t Repeat Yourself*).
- Write **clear and concise comments** when logic is not obvious.
- All code must **pass linting and tests** before merging.

---

## 3. 📁 Project Structure
```
/project-root
│
├── src/              # Main source code
├── tests/            # Unit and integration tests
├── docs/             # Documentation files
├── scripts/          # Helper scripts
└── config/           # Configuration files
```
- Keep related files close together.
- Avoid unnecessary nested folders.

---

## 4. 🧱 Naming Conventions
| Type | Convention | Example |
|------|-------------|----------|
| **Variables** | `camelCase` | `userEmail`, `totalPrice` |
| **Functions** | `camelCase` | `getUserData()`, `calculateTotal()` |
| **Classes** | `PascalCase` | `UserProfile`, `PaymentGateway` |
| **Constants** | `UPPER_SNAKE_CASE` | `MAX_RETRIES`, `API_URL` |
| **Files/Folders** | `kebab-case` | `user-profile.js`, `auth-service/` |

---

## 5. ✍️ Code Style

### 5.1 Indentation and Formatting
- Use **4 spaces** per indentation level.
- Max line length: **100 characters**.
- Place one blank line between functions and class definitions.
- Use **trailing commas** and **semicolons** where applicable.

### 5.2 Comments
- Use comments to explain *why*, not *what*.
- For functions:
  ```js
  /**
   * Calculates the total price of an order.
   * @param {number[]} items - Array of item prices.
   * @returns {number} Total price.
   */
  function calculateTotal(items) {
      return items.reduce((a, b) => a + b, 0);
  }
  ```

---

## 6. 🧪 Testing Standards
- Each function/class must have **unit tests**.
- Use a consistent **testing framework** (e.g., `pytest`, `jest`, `unittest`).
- Maintain a **minimum 80% coverage** threshold.
- Test file naming: `filename.test.js` or `test_filename.py`

---

## 7. 🔐 Security & Validation
- Always validate user input.
- Never expose secrets or tokens in the codebase.
- Use environment variables via `.env` files (never commit them).

---

## 8. 🪶 Git & Commit Guidelines

### Branch Naming
| Type | Format | Example |
|------|---------|----------|
| Feature | `feature/<description>` | `feature/add-login-page` |
| Fix | `fix/<description>` | `fix/navbar-bug` |
| Refactor | `refactor/<description>` | `refactor/api-calls` |

### Commit Message Format
```
<type>: <short summary>

[optional body with details or issue reference]
```
**Examples:**
- `feat: add user authentication`
- `fix: resolve crash on login`
- `docs: update API usage examples`

---

## 9. 🧰 Linting & Formatting Tools
Use automated tools to enforce consistency:
- **JavaScript/TypeScript**: ESLint + Prettier   
- **React**: Prettier + ESLint (Airbnb style)  

Run before every commit:
```bash
yarn dev
```

---

## 10. 🧾 Documentation & Comments
- Every module/class/function should have a short docstring or JSDoc.
- Update documentation whenever functionality changes.
- Use Markdown or Sphinx for generating developer docs.

---

## 11. ✅ Code Review Checklist
Before merging a PR, ensure:
- [ ] Code follows all standards.
- [ ] No unused imports or variables.
- [ ] All tests pass successfully.
- [ ] No sensitive data committed.
- [ ] Documentation is updated.

---

## 12. 👥 Versioning & Deployment
- Follow **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`
- Tag releases appropriately.
- Document breaking changes in `CHANGELOG.md`.

---

## 14. 📜 References
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Complete development setup
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Deployment checklist
