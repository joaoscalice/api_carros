var express = require('express')
var router = express.Router()

router.get("/", (req, res) => {
    res.json({status: true, msg: "Isso é um teste de API"})
})

module.exports = router;