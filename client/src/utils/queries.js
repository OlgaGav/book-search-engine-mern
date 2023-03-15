import { gql } from '@apollo/client';

export const GET_ME = gql`
  query me {
    me {
      _id
      username
      email
      savedBooks {
        _id
        authors
        description
        bookId
        image
        link
        title
      }
    }
  }
`;

export const USERS = gql`
  query users {
    users {
      _id
      username
      email
      savedBooks {
        _id
        authors
        description
        bookId
        image
        link
        title
      }
    }
  }
`;

export const USER_BY_USERNAME = gql`
  query user($username: String!) {
    user(username: $username) {
      _id
      username
      email
      savedBooks {
        _id
        authors
        description
        bookId
        image
        link
        title
      }
    }
  }
`;

export const USER_BY_ID = gql`
  query userById($userId: ID!) {
    userById(userId: $userId) {
      _id
      username
      email
      savedBooks {
        _id
        authors
        description
        bookId
        image
        link
        title
      }
    }
  }
`;

const SEARCH_GOOGLE_BOOKS = async (query) => {
  const graphqlQuery = gql`
    query SearchGoogleBooks($query: String!) {
      searchBooks(query: $query) {
        items {
          id
          volumeInfo {
            title
            authors
          }
        }
      }
    }
  `;

  const variables = { query };
  const endpoint = 'https://www.googleapis.com/books/v1/graphql';

  try {
    const response = await client.request(graphqlQuery, variables, endpoint);
    return response.searchBooks.items;
  } catch (error) {
    console.error(error);
  }
};
