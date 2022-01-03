/* eslint-disable require-jsdoc */
import { connectToDatabase } from "../../lib/dbConnect";
// import { getSession } from "next-auth/react";
export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const session = req.body.session;
  const token = req.body.token;
  const collectiongroupid = req.body.collectionid;
  const todoid = req.body.todoid;
  // console.log(token);
  const rt = process.env.NEXT_PUBLIC_DBTOKEN;
  // const session = await getSession({ req });
  // console.log(`Session Info: ${session}`);

  if (token != rt) {
    return res.status(200).send({
      status: "Unauthorized",
      collection: null,
    });
  }
  if (!session) {
    return res.status(200).send({
      status: "Unauthorized",
      collection: null,
    });
  }

  if (req.method === "POST") {
    const user = await db.collection("users").findOne({
      email: session.user.email,
    });
    if (user) {
      // console.log(user);
      function findCollection(collection) {
        return collection.groupid === collectiongroupid;
      }
      function findTodo(todo) {
        return todo.itemid === todoid;
      }
      const collection = user.collections.find(findCollection);
      const todo = collection.todos.find(findTodo);

      if (collection === undefined) {
        return res.status(200).send({
          status: "Todo not found",
          todo: null,
        });
      }
      return res.status(201).send({
        status: "Todo found",
        todo: todo,
      });
    } else {
      return res.status(200).send({
        status: "Todo not found",
        todo: null,
      });
    }
  } else {
    return res.status(200).send({
      status: "Todo not found",
      todo: null,
    });
  }
}
