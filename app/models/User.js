import { ObjectId } from "mongodb";

class User {
  constructor(data) {
    this._id = data._id
      ? ObjectId.createFromHexString(data._id)
      : new ObjectId();
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || "attendee"; // Default role is attendee
    this.createdAt = data.createdAt || new Date();
  }

  // Remove the setPassword method as we're now hashing in the API route
}

export default User;
