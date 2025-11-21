# Git Configuration Setup

## Issue: Red × Signs on GitHub Commits

If you see red × (unverified) signs next to your commits on GitHub, it means your git configuration is using placeholder or invalid credentials.

## Solution: Configure Git Properly

### Step 1: Set Your Git Username and Email

Configure git to use your GitHub username and verified email address:

```bash
git config --global user.name "Your GitHub Username"
git config --global user.email "your-github-email@example.com"
```

**Important:** Use the email address associated with your GitHub account. You can find your GitHub email addresses at:
https://github.com/settings/emails

### Step 2: Verify Your Configuration

Check that your configuration is correct:

```bash
git config --get user.name
git config --get user.email
```

### Step 3: Sign Your Commits (Optional but Recommended)

For additional verification, you can set up commit signing with GPG:

1. Generate a GPG key (if you don't have one):
   ```bash
   gpg --full-generate-key
   ```

2. Add the GPG key to your GitHub account:
   - Get your GPG key ID: `gpg --list-secret-keys --keyid-format=long`
   - Export your public key: `gpg --armor --export YOUR_KEY_ID`
   - Add it to GitHub: https://github.com/settings/keys

3. Configure git to sign commits:
   ```bash
   git config --global user.signingkey YOUR_KEY_ID
   git config --global commit.gpgsign true
   ```

## About Existing Red × Commits

The red × signs on existing commits in the main branch cannot be fixed without rewriting git history (force push), which is:
- Not recommended for shared/main branches
- Can cause issues for other collaborators
- May break existing pull requests

**Best Practice:** Focus on configuring git correctly for future commits. The existing unverified commits are a historical artifact and don't affect the functionality of the code.

## For Repository Maintainers

If you need to fix the commit history (use with caution):

1. **Backup your repository first**
2. Use `git filter-branch` or `git rebase` to rewrite commits
3. Force push to GitHub: `git push --force`
4. Have all collaborators re-clone the repository

**Warning:** Force pushing rewrites history and can cause data loss if not done carefully. Only do this if absolutely necessary and coordinate with all team members.

## Quick Reference

| Command | Purpose |
|---------|---------|
| `git config --global user.name "Name"` | Set your git username |
| `git config --global user.email "email@example.com"` | Set your git email |
| `git config --list` | View all git configuration |
| `git log --format="%H %an <%ae>"` | Check author info in commits |

## Resources

- [GitHub: Setting your commit email address](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-email-preferences/setting-your-commit-email-address)
- [GitHub: About commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)
