#!/usr/bin/env node

// თქვენი დავალებაა ააწყოთ expense-cli  ქომანდერის დახამრებით.
// 1) უნდა გქონდეს CRUD - create, read, update, delete, getById ფუნცქიონალი. იქსფენსების აპლიკაციაში უნდა გქონდეთ მინიმუმ 4 ფილდი. მაგალითად category, price, id, date დანარჩენი თქვენი ფანტაზიით დაამატეთ.
// 2) დამატების დროს აიდისთან ერთად დაამატეთ დრო, როდის მოხდა ამ იქსფენსის დამატება. და შესაბამისად show(ყველა იქსფენსის) ნახვის დროს გააყოლეთ --asc --desc რომელიც დაალაგებს შექმნის თარიღს ზრდადობა კლებადობით იქსფენსებს.
// 3) აფდეითის დროს უნდა დააფდეითოთ ნებისმიერი ფილდი რომელსაც გადააწოდებთ.
// 4) დაამატეთ ქომანდი, expense-cli price --asc ან --desc აქაც დაალაგებს ზრდადობა კლებადობით იქსფენსების ფასებს და ისე დაგიბრუნებთ.
// 5) შექმნის დროს დაადეთ ვალიდაცია მინიმალური ხარჯი უნდა იყოს 10 ლარი. მაგაზე ნაკლებს თუ შეიყვანს იუზერი რამე ერორი დაურტყით ვალიდაციის.

import { Command } from "commander";
import fs from "fs/promises";

const readFile = async (filePath, isParsed) => {
  if (!filePath) return null;
  const data = await fs.readFile(filePath, "utf-8");
  return isParsed ? JSON.parse(data || []) : data;
};

const validatePrice = async (price) => {
  if (price < 10) {
    throw new Error("expence price must be 10 or more");
  }
};

const writeFile = async (filePath, data, isStringify) => {
  if (!filePath) return null;
  await fs.writeFile(filePath, isStringify ? JSON.stringify(data) : data);
};

const program = new Command();

program
  .command("create")
  .option("--category <category>")
  .option("--price <price>")
  .option("--description <description>")
  .action(async (opts) => {
    const expences = await readFile("expense.json", true);
    const lastId = expences[expences.length - 1]?.id || 0;
    const newExpenses = {
      id: lastId + 1,
      date: new Date().toISOString(),
    };
    if (opts.category) newExpenses.category = opts.category;
    if (opts.price) newExpenses.price = opts.price;
    if (opts.description) newExpenses.description = opts.description;
    validatePrice(opts.price);
    expences.push(newExpenses);
    await writeFile("expense.json", expences, true);
    console.log("new expences created");
  });

program
  .command("read")
  .option("--asc")
  .option("--desc")
  .action(async (opts) => {
    const expences = await readFile("expense.json", true);
    if (opts.asc) {
      expences.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (opts.desc) {
      expences.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    console.log(expences);
  });

  
program
.command("price")
.option("--asc")
.option("--desc")
.action(async (opts) => {
  const expences = await readFile("expense.json", true);
  if (opts.asc) {
    expences.sort((a, b) => a.price - b.price);
  } else if (opts.desc) {
    expences.sort((a, b) => b.price - a.price);
  }
  console.log(expences);
});

program
  .command("update")
  .argument("<id>")
  .option("--category <category>")
  .option("--price <price>")
  .option("--description <description>")
  .action(async (id, opts) => {
    const expences = await readFile("expense.json", true);
    const index = expences.findIndex((e) => e.id === Number(id));
    if (index === -1) {
      console.log(`Expense with ID ${id} not found`);
      return;
    }
    if (opts.category) expences[index].category = opts.category;
    if (opts.price) expences[index].price = opts.price;
    if (opts.description) expences[index].description = opts.description;
    await writeFile("expense.json", expences, true);
    console.log("new expences updated", expences[index]);
  });

program
  .command("delete")
  .argument("<id>")
  .action(async (id) => {
    const expences = await readFile("expense.json", true);
    const index = expences.findIndex((e) => e.id === Number(id));
    if (index === -1) {
      console.log(`Expense with ID ${id} not found`);
      return;
    }

    const deletedExpenses = expences.splice(index, 1);
    await writeFile("expense.json", expences, true);
    console.log("deleted", deletedExpenses);
  });


program.parse();
