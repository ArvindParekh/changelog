import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
   providers: [
      CredentialsProvider({
         // The name to display on the sign in form (e.g. "Sign in with...")
         name: "Credentials",
         // `credentials` is used to generate a form on the sign in page.
         // You can specify which fields should be submitted, by adding keys to the `credentials` object.
         // e.g. domain, username, password, 2FA token, etc.
         // You can pass any HTML attribute to the <input> tag through the object.
         credentials: {
            username: {
               label: "Username",
               type: "text",
               // placeholder: "jsmith",
            },
            password: { label: "Password", type: "password" },
         },
         async authorize(credentials, req) {
            // Add logic here to look up the user from the credentials supplied

            const newUser = {
               id: "1",
               username: "arvind",
               password: process.env.NEXTAUTH_SIGNIN_PASSWORD,
            };

            if (
               newUser.username === credentials?.username &&
               newUser.password === credentials.password
            ) {
               // Any object returned will be saved in `user` property of the JWT
               return newUser;
            } else {
               // If you return null then an error will be displayed advising the user to check their details.
               return null;

               // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
            }
         },
      }),
   ],
   callbacks: {
      async redirect({ url, baseUrl }) {
         console.log(url, baseUrl);
         return "/new-log";
      },
   },
};
