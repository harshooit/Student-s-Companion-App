
# How to Put Your App Online (Final Guide)

This is the final, simplified guide to get your app working on Netlify.

---

### Step 1: Add Your Secret Keys (The Only Manual Step)

1.  Open the `env.ts` file in your project.
2.  **Carefully copy and paste** your secret keys from Firebase and Google into the placeholder spots (e.g., replace `'YOUR_FIREBASE_API_KEY_HERE'` with your actual key).
3.  Save the `env.ts` file.

---

### Step 2: Put Your Code on GitHub (Must Be Private)

Because your secret keys are now in your code, your GitHub repository **must be private**.

1.  Go to [GitHub.com](https://github.com/) and log in.
2.  Create a **new repository**.
3.  Give it a name and make sure you select the **"Private"** option.
4.  Follow GitHub's instructions to "push an existing repository from the command line". This will upload your project folder to your new private repository.

---

### Step 3: Deploy on Netlify

1.  Log in to [Netlify.com](https://app.netlify.com/).
2.  Click **"Add new site"** -> **"Import an existing project"**.
3.  Connect to GitHub and select your **private repository**.
4.  Netlify will ask for build settings. **Leave everything as the default.**
5.  Click **"Deploy site"**.

That's it. Netlify will build your site from your private repository. Since the keys are already in the `env.ts` file, it will work immediately after deployment.
