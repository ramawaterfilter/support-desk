import React from "react";

export function LoginForm() {
  return (
    <div className="min-h-screen bg-supportDesk-darkBlue text-white p-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6">Staff Login</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-supportDesk-lighterBlue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white bg-supportDesk-lighterBlue"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-supportDesk-accent text-white py-2 rounded hover:bg-supportDesk-accent/90"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
