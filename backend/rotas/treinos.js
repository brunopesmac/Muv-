const express = require("express");
const router = express.Router();
const Treino = require("../models/treino");

//Conexão Treino
router.get("/usuario/:id", async (req, res) => {
  try {
    const treino = await Treino.find({assignTo: req.params.id})
      .populate(["exercicios"])
      .sort({ posicao: 1 });

    return res.send({ treino });
  } catch {
    return res.status(400).send({ error: "Erro ao carregar treinos" });
  }
});

router.get("/:id", (req, res, next) => {
  try {
    const treino = new Treino.findById(req.params.id)
    .populate(["usuario",  "exercicios"]);

    return res.send({ treino });
  } catch {
    return res.status(400).send({ error: "Erro ao carregar treino" });
  }
});

router.post("", async (req, res) => {
  console.log(req.body)
  try {
    const { nome, assignTo, exercicios } = req.body;

    const treino = await Treino.create({ nome, assignTo, exercicios });
    
    // await Promise.all(
    //   exercicios.map(async (exercicio) => {

    //     treino.exercicios.push(exercicio._id);
    //   })
    // );
    
    const lastTreino = await Treino.find()
    .sort({ posicao: -1 })
    .limit(1);

    treino.posicao = lastTreino[0].posicao + 1;

    await treino.save();

    return res.send({ treino });
  } catch (err) {
    console.log(err)
    return res.status(400).send({ error: "Erro ao criar novo treino" });
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    Treino.findByIdAndRemove(req.params.treinoId).populate('usuario');

    return res.send();
  } catch {
    return res.status(400).send({ error: "Erro ao remover treino" });
  }
});

router.put("/:id", (req, res, next) => {
  try {
    const { nome, posicao, exercicios } = req.body;

    const treino = Treino.findByIdAndUpdate(
      req.params.treinoId,
      { nome, posicao },
      { new: True }
    );

    treino.exercicios = [];

    Exercicio.remove({ treino: treino._id });

    Promise.all(
      exercicios.map(async (exercicio) => {
        const treinoExercicio = new Exercicio({
          ...exercicios,
          treino: treino._id,
        });

        treinoExercicio.save();

        treino.exercicios.push(treinoExercicio);
      })
    );

    treino.save();

    return res.send({ treino });
  } catch (err) {
    return res.status(400).send({ error: "Erro ao atualizar treino" });
  }
});

router.put("", (req, res, next) => {
  try {
    treinos = req.body;
    for (let treino of treinos) {
      Treino.updateOne(
        {_id: treino.id}
        , treino
      ).then();
    }

    res.status(200).json({ mensagem: treinos });
  } catch (err) {
    return res.status(400).send({ error: "Erro ao favoritar treino" });
  }
});

module.exports = router;
