const express = require("express")
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")
const cors = require("cors")
require("dotenv").config()

const app = express()
app.use(cors())
app.use(express.json())

const uri = process.env.MONGODB_URI
const port = process.env.PORT || 4000

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})
async function run() {
  try {
    await client.connect()

    const craftCollection = client.db("craftDb").collection("craft")

    app.get("/craft", async (req, res) => {
      const crafts = craftCollection.find().sort({ createdAt: -1 })
      const result = await crafts.toArray()
      res.send(result)
    })

    app.get("/my-craft/:email", async (req, res) => {
      const email = req.params.email
      const query = { user_email: email }
      const result = craftCollection.find(query)
      const crafts = await result.toArray()
      res.send(crafts)
    })

    app.get("/craft/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await craftCollection.findOne(query)
      res.send(result)
    })

    app.post("/craft", async (req, res) => {
      const craftData = req.body
      const result = await craftCollection.insertOne(craftData)
      res.send(result)
    })

    app.put("/craft/:id", async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updatedCraft = req.body

      const craftData = {
        $set: {
          image: updatedCraft?.image || "",
          item_name: updatedCraft?.item_name || "",
          subcategory_name: updatedCraft?.subcategory_name || "",
          short_description: updatedCraft?.short_description || "",
          price: updatedCraft?.price || "",
          rating: updatedCraft?.rating || "",
          customization: updatedCraft?.customization || "",
          processing_time: updatedCraft?.processing_time || "",
          stock_status: updatedCraft?.stock_status || "",
        },
      }

      const result = await craftCollection.updateOne(filter, craftData, options)
      res.send(result)
    })

    app.delete("/craft/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await craftCollection.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("craftDb").command({ ping: 1 })
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    )
  } finally {
    // await client.close()
  }
}
run().catch(console.dir)

app.get("/", (req, res) => {
  res.send("Coffee making server is running")
})

app.listen(port, () => {
  console.log(`Coffee Server is running on port: ${port}`)
})
