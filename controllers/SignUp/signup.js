const SignUpLink = async (req, res, db, bcrypt) => {
  try {
    // Extract the name, email, and password fields from the request body sent by the client:
    const { name, email, password } = req.body; //destructuring
    console.log(req.body.name);
    // CHECK if a user with the given email already exists in the 'login' table of the database:
    const existingUser = await db("login").where({ email }).first();

    if (existingUser) {
      // If such a USER EXISTS, send an HTTP response with status code 400 and an error message:
      return res.status(400).json({ error: "User already exists" });
    } //end of existingUser

    // Hashing a password
    const hashedPassword = await bcrypt.hash(password, 10);
    // If the user DOES NOT already exist, insert a new user with the given name, email, and registration date into the 'users' table of the database:
    await db.transaction(async (trx) => {
      await trx("users").insert({
        name,
        email,
        joined: new Date(),
      });
      // Insert the hashed password into the 'login' table of the database along with the user's email:
      await trx("login").insert({
        email,
        hash: hashedPassword,
      });
    });
    // Send an HTTP response with status code 201, the newly created user object, and a success message:
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    // If there was an error during this process, log the error and send an HTTP response with status code 500 and an error message:
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  SignUpLink: SignUpLink,
};
