/* eslint-disable require-jsdoc */
import { connectToDatabase } from "../../lib/dbConnect";
import { getToken } from "next-auth/jwt";
// import { getSession } from "next-auth/react";
export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const session = req.body.session;
  const todoid = req.body.id;
  const checked = req.body.checked;
  const collectionid = req.body.collectionid;
  const rt = process.env.NEXT_PUBLIC_DBTOKEN;
  const token = req.body.token;
  const subtodoid = req.body.subtodoid;

  // const session = await getSession({ req });
  // console.log(`Session Info: ${session}`);

  const secret = process.env.JWT_SECRET;

  const token2 = await getToken({ req, secret });

  if (token2 == null) {
    return res.status(200).send({
      status: "Unauthorized",
      user: null,
    });
  }
    if (token2.email != session.user.email) {
      return res.status(200).send({
        status: "Unauthorized",
        user: null,
      });
    }
  if (token != rt) {
    return res.status(200).send({
      status: "Unauthorized",
      user: null,
    });
  }

  if (!session) {
    return res.status(200).send({
      status: "Unauthorized",
      user: null,
    });
  }

  if (req.method === "POST") {
    const user = await db
      .collection("users")
      .findOne({ email: session.user.email });
    if (user) {
      function findCollection(collection) {
        return collection.groupid === collectionid;
      }
      const collection = user.collections.findIndex(findCollection);

      const findItem = user.collections[collection].todos.findIndex(
        (todos) => todos.itemid === todoid
      );
      if (findItem <= -1) {
        console.log("Item not found");
        return res.status(200).send({
          status: "Todo not found",
          user: null,
        });
      }
      if (subtodoid != null || subtodoid != undefined) {
        const findSubItem = user.collections[collection].todos[
          findItem
        ].subtodo.findIndex((subtodo) => subtodo.subtodoid === subtodoid);
        if (findSubItem <= -1) {
          console.log("Subtodo not found");
          return res.status(200).send({
            status: "Subtodo not found",
            user: null,
          });
        }
        await db.collection("users").updateOne(
          { email: session.user.email },
          {
            $set: {
              [`collections.${collection}.todos.${findItem}.subtodo.${findSubItem}.checked`]:
                checked,
            },
          }
        );
        return res.status(201).send({
          status: "Updated",
          user: user.collections[collection].todos[findItem].subtodo[
            findSubItem
          ],
        });
      } else {
        await db.collection("users").updateOne(
          { email: session.user.email },
          {
            $set: {
              [`collections.${collection}.todos.${findItem}.checked`]: checked,
            },
          }
        );
        return res.status(201).send({
          status: "Updated",
          user: user.collections[collection].todos[findItem],
        });
      }
    }
  } else {
    console.log("user not found");
  }
}
