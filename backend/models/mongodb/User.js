import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Virtual for user_id to match MySQL response structure
UserSchema.virtual("user_id").get(function () {
  return this._id.toHexString();
});

UserSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.user_id = ret._id.toString();
    return ret;
  },
});

UserSchema.set("toObject", { virtuals: true });

const User = mongoose.model("User", UserSchema);
export default User;
