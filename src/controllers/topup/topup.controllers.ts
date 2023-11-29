import { Request, Response } from "express";
import { TopupDataTypes } from "./types";
import { db } from "../../lib/db";
import { uploads } from "../../vendor/cloudinary";
import fs from "fs";
import { Prisma, Transaction } from "@prisma/client";

const createTransaction = async (req: any, res: Response) => {
  try {
    const { Point, Amount, Price, RiotID } = req.body;
    const { id } = req.user;
    const transactionData: TopupDataTypes = {
      Amount: parseInt(Amount),
      Point: Point,
      Price: Price,
      Total: Price * parseInt(Amount),
      RiotID: RiotID,
      userId: id,
      status: 1,
    };
    const [transaction] = await db.$transaction([
      db.transaction.create({
        data: {
          ...transactionData,
        },
      }),
    ]);

    res.status(201).json({
      success: true,
      message: "Transaction Success",
      data: { t_id: transaction.id },
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const getTransactionById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { email, id: userId } = req.user;

    const transaction = await db.transaction.findUnique({
      where: { id, userId },
    });
    if (transaction) {
      const data = { ...transaction, email };

      return res.json({
        success: true,
        message: "GET TRANSACTION BYID SUCCESS",
        data,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "TRANSACTION NOT FOUND",
      });
    }
  } catch (error) {
    res.status(400).json(error);
  }
};

const getTransaction = async (req: any, res: Response) => {
  try {
    const { id: userId } = req.user;
    const { search, status } = req.query;

    const pageSize = 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const offset = (page - 1) * pageSize;
    const orderBy = req.query.order ? req.query.order : "createdAt";
    const direction = req.query.direction ? req.query.direction : "ASC";

    const result: any = await db.$queryRaw<Transaction>`SELECT *
      FROM transaction
      WHERE
        userId = ${userId}
        AND (
          RiotID LIKE CONCAT('%', ${search}, '%')
          OR id LIKE CONCAT('%', ${search}, '%'))
          ORDER BY createdAt DESC
          LIMIT ${pageSize} OFFSET ${offset}
        `;
    const rawResult: any = await db.$queryRaw<Transaction>`SELECT *
         FROM transaction
         WHERE
           userId = ${userId}
           AND (
            RiotID LIKE CONCAT('%', ${search}, '%')
            OR id LIKE CONCAT('%', ${search}, '%'))
            ORDER BY createdAt DESC
           `;
    //  ORDER BY ${
    //    orderBy === "createdAt" ? "createdAt" : `"${orderBy}"`
    // } ${direction}
    // -- ${status ? `AND status = ${parseInt(status)}` : ""}

    // let query = `SELECT * FROM transaction WHERE userId = ${userId} AND (
    //   RiotID LIKE CONCAT('%', ${search}, '%')
    //   OR id LIKE CONCAT('%', ${search}, '%')
    // )`;
    //   if (status) {
    //     query += `
    //   AND status = ${parseInt(status)}
    // `;
    //   }
    //   query += `ORDER BY createdAt ASC;`;
    // const transaction = await db.$queryRaw`${query}`;

    const totalPage = Math.ceil(rawResult.length / pageSize);
    const prevPage = page > 1;
    const nextPage = page < totalPage;

    res.json({
      success: true,
      message: "GET TRANSACTION SUCCESS",
      prevPage,
      nextPage,
      totalPage,
      pageNow: page,
      data: result,
      length: rawResult.length,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

const uploadPayment = async (req: any, res: Response) => {
  try {
    let fileUploaded = req.file;
    const { id } = req.params;

    if (!fileUploaded) throw "Picture not found";

    const { path } = fileUploaded;
    const uploder = async (path: any) => await uploads(path, "xpvalor/payment");
    const paymentResponse = await uploder(path);
    fs.unlinkSync(path);

    await db.transaction.update({
      where: { id },
      data: {
        status: 2,
        imagePayment: paymentResponse.url,
      },
    });
    return res.json({
      success: true,
      message: "UPLOAD PAYMENT SUCCESS",
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

export { createTransaction, getTransaction, getTransactionById, uploadPayment };
