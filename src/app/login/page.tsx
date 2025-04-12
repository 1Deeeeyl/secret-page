import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input className='border border-indigo-600' id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input className='border border-indigo-600' id="password" name="password" type="password" required />
      <button formAction={login}>Log in</button>
      <button formAction={signup}>Sign up</button>
    </form>
  )
}