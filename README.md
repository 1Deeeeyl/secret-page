<a name="readme-top"></a>

<h1>Secret Page App</h1>

<div align="center" >
<div>
    <img src="https://raw.githubusercontent.com/1Deeeeyl/v1Portfolio/main/src/assets/images/projects/login.png" alt="Secret Page App Preview" width="1080" style="margin-top: 15px">
</div>



</div>

---

<h2 style="margin-top: 25px">About</h2>
<p>
  The Secret Page App is a multi-page authentication project featuring protected routes, user accounts, secret messages, and a simple friend system. Authenticated users can create and update their own secret messages, manage friendships, and access restricted content with proper permissions.
</p>

<h2 style="margin-top: 25px">Features</h2>

- **User Authentication**
  - Users can register, log in, and access authenticated pages.
  - Authenticated users can delete their own accounts.

- **Secret Messages**
  - View your own secret message on <code>/secret-page-1</code>.
  - Add or update your personal secret message on <code>/secret-page-2</code>.

- **Friends System**
  - Add other users as friends.
  - Accept or decline friend requests.
  - Friends can view each other’s secret messages.
  - Non-friends attempting to view private content receive a <code>403 Forbidden</code>.

- **Protected Routes**
  - All secret pages are accessible only to logged-in users.
  - Reused shared logic across pages without overwriting implementations.

<h2 style="margin-top: 25px">Technologies Used</h2>
<p>
  Built using <b><a href='https://nextjs.org/' target="_blank" rel="noopener noreferrer">Next.js</a></b> and <b><a href='https://supabase.com/' target="_blank" rel="noopener noreferrer">Supabase</a></b>. Styled with <b><a href='https://tailwindcss.com/' target="_blank" rel="noopener noreferrer">Tailwind CSS</a></b>.
</p>

<p>
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nextjs,supabase,tailwind,vercel" />
  </a>
</p>

<h2 style="margin-top: 25px">How To Use</h2>
<p>
  Feel free to fork this project or explore the source code. Below are the steps to run it locally:
</p>

<h3>Installation</h3>

1. <b>Clone The Repository</b>
<div style="margin-top: 15px; margin-bottom: 15px">
    <img src="https://raw.githubusercontent.com/1Deeeeyl/v1Portfolio/main/readmefiles/1.svg" alt="Clone Repo" width="500">
</div>

2. <b>Navigate To The Project Directory</b>
<div style="margin-top: 15px; margin-bottom: 15px">
    <img src="https://raw.githubusercontent.com/1Deeeeyl/v1Portfolio/main/readmefiles/2.svg" alt="Navigate Folder" width="300">
</div>

3. <b>Install Dependencies</b>
<div style="margin-top: 15px; margin-bottom: 15px">
    <img src="https://raw.githubusercontent.com/1Deeeeyl/v1Portfolio/main/readmefiles/3.svg" alt="Install Dependencies" width="300">
</div>

4. <b>Run the Development Server</b>
<div style="margin-top: 15px; margin-bottom: 15px">
    <img src="https://raw.githubusercontent.com/1Deeeeyl/v1Portfolio/main/readmefiles/4.svg" alt="Run Dev Server" width="300">
</div>

<h2 style="margin-top: 25px">License</h2>
This project is licensed under the MIT License — see the <a href="LICENSE.md">LICENSE.md</a> file for more details.
