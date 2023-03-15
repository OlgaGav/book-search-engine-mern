const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password")
          .populate("savedBooks");
        return userData;
      }
      console.log("Not logged in");
    },
    users: async () => {
      return User.find().select("-__v -password").populate("savedBooks");
    },
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .select("-__v -password")
        .populate("savedBooks");
    },
    userById: async (parent, { userId }) => {
      return User.findOne({ _id: userId })
        .select("-__v -password")
        .populate("savedBooks");
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({
        $or: [{ email }, { username: email }],
      });
      if (!user) {
        console.log("Incorrect credentials");
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        console.log("Incorrect credentials");
      }
      const token = signToken(user);
      return { token, user };
    },
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      if (!user) {
        console.log("Something went wrong!");
      }
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { book }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book } },
          { new: true, runValidators: true }
        ).populate("savedBooks");
        return updatedUser;
      }
      console.log("You need to be logged in!");
    },
    deleteBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        if (!updatedUser) {
          console.log("Couldn't find user with this id!");
        }
        return updatedUser;
      }
      console.log("Not logged in");
    },
  },
};

module.exports = resolvers;
