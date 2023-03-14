const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const foundUser = await User.findOne({ _id: context.user._id });
        return foundUser;
      }
      throw new AuthenticationError('Not logged in');
    },
    user: async (parent, { userId, username }) => {
      const params = userId ? { _id: userId } : { username };
      const foundUser = await User.findOne(params);
      if (!foundUser) {
        throw new Error('Cannot find a user with this id or username');
      }
      return foundUser;
    },
  },
  Mutation: {
    createUser: async (parent, { input }) => {
      const user = await User.create(input);
      if (!user) {
        throw new Error('Something went wrong');
      }
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { input }) => {
      const { username, email, password } = input;
      const user = await User.findOne({ $or: [{ username }, { email }] });
      if (!user) {
        throw new Error("Can't find this user");
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new Error('Wrong password!');
      }
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: input } },
            { new: true, runValidators: true }
          );
          return updatedUser;
        } catch (err) {
          throw new Error(err);
        }
      }
      throw new AuthenticationError('Not logged in');
    },
    deleteBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        if (!updatedUser) {
          throw new Error("Couldn't find user with this id!");
        }
        return updatedUser;
      }
      throw new AuthenticationError('Not logged in');
    },
  },
};

module.exports = resolvers;
