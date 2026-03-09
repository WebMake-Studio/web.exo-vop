# 🔐 Security Policy

## Supported Versions

Only the latest stable version of each project receives security updates.
Older versions are not actively maintained unless explicitly stated in the project's README.

| Version | Supported |
|---------|-----------|
| Latest (`main` / `master`) | ✅ Yes |
| Older releases | ❌ No |

---

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in any of my projects, I ask that you report it responsibly through one of the following private channels:

### 📧 Email *(preferred)*

Send a detailed report to:

> **[INSERT YOUR EMAIL HERE]**

Use the subject line: `[SECURITY] <project-name> — <short description>`

### 🔒 GitHub Private Vulnerability Reporting *(if enabled)*

On the affected repository:
**Security** tab → **Report a vulnerability** → Fill in the form.

---

## What to Include in Your Report

To help me understand and resolve the issue as quickly as possible, please include:

- **Project name** and affected version or commit
- **Description** of the vulnerability (type, location, potential impact)
- **Steps to reproduce** — as detailed as possible
- **Proof of concept** — code snippet, screenshot or payload (if applicable)
- **Suggested fix** — optional, but appreciated

---

## Response Timeline

| Step | Timeframe |
|------|-----------|
| Acknowledgement of receipt | Within **48 hours** |
| Initial assessment | Within **5 business days** |
| Fix or mitigation | Within **30 days** (critical issues prioritized) |
| Public disclosure | After fix is deployed |

I follow a **responsible disclosure** model. I will coordinate with you on timing before any public announcement.

---

## Scope

The following are considered **in scope** for security reports:

- Authentication or authorization bypasses
- SQL injection, XSS, CSRF vulnerabilities
- Sensitive data exposure (credentials, API keys, PII)
- Remote code execution (RCE)
- Insecure direct object references (IDOR)
- Supply chain vulnerabilities (compromised dependencies)
- Security misconfigurations in deployed infrastructure

The following are considered **out of scope**:

- Vulnerabilities in third-party services or libraries (report to them directly)
- Issues requiring physical access to a device
- Denial of service (DoS) attacks
- Social engineering or phishing
- Issues in unsupported/archived repositories
- Theoretical vulnerabilities with no practical exploit

---

## Responsible Disclosure

I kindly ask that you:

- **Do not** exploit the vulnerability beyond what is necessary to demonstrate it
- **Do not** access, modify or delete data that isn't yours
- **Do not** publicly disclose the issue before a fix has been deployed
- **Do** give me a reasonable time to respond and patch before going public

In return, I commit to:

- Responding promptly and keeping you informed of progress
- Crediting you in the security advisory (unless you prefer to remain anonymous)
- Not taking legal action against researchers acting in good faith

---

## Security Best Practices for Contributors

If you're contributing to any of my repositories, please follow these guidelines:

- **Never commit secrets** — no API keys, tokens, passwords or credentials in code
- Use `.env` files and add them to `.gitignore`
- Keep dependencies up to date and audit them regularly (`npm audit`, `pip audit`, etc.)
- Validate and sanitize all user inputs
- Use HTTPS for all external requests
- Follow the principle of least privilege for any permissions or database policies

---

## Hall of Fame

Researchers who have responsibly disclosed a valid vulnerability will be credited here (with their consent).

*No reports yet — be the first!*

---

## Contact

For any non-security-related questions, please use the standard issue tracker or contact channels listed in each project's README.

---

<div align="center">
  <sub>© Rafael ISTE / FarTekTV — All rights reserved.</sub>
</div>
