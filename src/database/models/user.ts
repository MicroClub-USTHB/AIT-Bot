import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    _id: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    _id: false,
    versionKey: false,
    timestamps: true,

  }
);

const UserModel = model('users', UserSchema);



export { UserModel };
