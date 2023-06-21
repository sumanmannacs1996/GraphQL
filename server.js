const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLInt, GraphQLString, GraphQLList} = require('graphql')


// Data
const authors = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'J. R. R. Tolkien' },
    { id: 3, name: 'Brent Weeks' }
]
const books = [
    { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
    { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
    { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
    { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
    { id: 5, name: 'The Two Towers', authorId: 2 },
    { id: 6, name: 'The Return of the King', authorId: 2 },
    { id: 7, name: 'The Way of Shadows', authorId: 3 },
    { id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const app = express()
const PORT = 5000

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "This represent author who writen the books",
    fields:()=> ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author)=> books.filter(book=> book.authorId === author.id)
        }
    })
})

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "This represent book writen by an author",
    fields:()=> ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (book)=> authors.find(author=> author.id === book. authorId)
        }
    })
})

const rootQueryType = new GraphQLObjectType({
    name: "Query",
    description: "Root Query",
    fields: () => ({
        books: {
            type: new GraphQLList(BookType),
            description: "List of books.",
            resolve: ()=> books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: "List of authors",
            resolve: ()=> authors
        },
        book: {
            type: BookType,
            description: "A single book",
            args: {
               id: { type: GraphQLInt}
            },
            resolve: (parent,args)=> books.find(book=> book.id === args.id)
        },
        author: {
            type: AuthorType,
            description: "A single author",
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args)=> authors.find(author=> author.id === args.id)
        }
    })
})

const rootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: "Root Mutation",
    fields: () => ({
        addBook: {
            type: BookType,
            description: "Add a book",
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                authorId: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const book = { id: books.length + 1, name: args.name, authorId: args.authorId }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: "Add a author",
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const author = { id: authors.length + 1, name: args.name}
                authors.push(author)
                return author
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: rootQueryType,
    mutation: rootMutationType,
})

app.use('/graphql', expressGraphQL({
    graphiql: true,
    schema: schema

}))

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));