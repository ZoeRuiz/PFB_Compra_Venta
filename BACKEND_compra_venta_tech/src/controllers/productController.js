import { getAcceptProductListModel, getProductById, deleteProductModel, setProductAsSoldModel, getPendingProductListModel, addVisitProductModel, getProductListById } from "../models/productModels.js";
import { deletePhoto } from "../utils/helpers.js";
import { sendProductRejectionEmail } from "../utils/emailConfig.js";

export async function getProductListController(req, res, next) {
  try {
    let products = [];

    //Si es un Administrador visualizamos productos pendientes.
    if (req.user?.role === "admin") {
      products = await getPendingProductListModel();
    } else {
      //Si es un Usuario visualizamos productos aceptados
      products = await getAcceptProductListModel();
    }

    if (!products) {
      return res.status(404).send({
        status: "Error",
        message: "Productos no encontrados",
      });
    }
    res.send({
      status: "OK",
      data: products,
    });
  } catch (e) {
    next(e);
  }
}

export async function getUserProductListController(req, res, next) {
  try {
    const userId = parseInt(req.params.id);
    let products = [];
    products = await getProductListById(userId);
    if (!products) {
      return res.status(404).send({
        status: "Error",
        message: "Productos no encontrados",
      });
    }
    res.send({
      status: "OK",
      data: products,
    });
  } catch (e) {
    next(e);
  }
}

//Funcion controladora para obtener detalles de los productos
export async function getProductDetails(req, res, next) {
  try {
    const productId = parseInt(req.params.id);
    const product = await getProductById(productId);

    if (!product) {
      return res.status(404).send({
        status: "Error",
        message: "Producto no encontrado",
      });
    }
    res.send({
      status: "OK",
      data: product,
    });
  } catch (e) {
    next(e);
  }
}

export async function deleteProductController(req, res, next) {
  try {
    const productId = parseInt(req.params.id);

    //borramos la foto de Public
    const actualProduct = await getProductById(productId);

    if (actualProduct.photo) {
      await deletePhoto(actualProduct.photo);
    }

    const product = await deleteProductModel(productId);

    if (!product) {
      return res.status(404).send({
        status: "Error",
        message: "Producto no encontrado",
      });
    }
    res.send({
      status: "Producto Eliminado",
      data: product,
    });
  } catch (e) {
    next(e);
  }
}

export async function setProtucdAsSoldController(req, res, next) {
  try {
    const productId = Number(req.params.id);

    await setProductAsSoldModel(productId);

    res.status(200).json({
      status: "success",
      message: `Producto ${productId} marcado como vendido.`,
    });
  } catch (err) {
    next(err);
  }
}
export async function addVisitProductController(req, res, next) {
  try {
    const productId = req.params.id;

    const updatedProduct = await addVisitProductModel(productId);

    res.send({
      status: "ok",
      message: "La visita se ha incrementado correctamente",
      data: {
        id: productId,
        updatedProduct,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function rejectProductController(req, res, next) {
  try {
    const { id } = req.params;

    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }

    await deleteProductModel(id);

    await sendProductRejectionEmail(product.user_email, product.user_name, product.name);

    res.json({ status: "ok", message: "Producto rechazado y notificación enviada" });
  } catch (e) {
    next(e);
  }
}
