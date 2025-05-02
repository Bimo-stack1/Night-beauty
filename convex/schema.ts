import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  items: defineTable({
    name: v.string(),
    price: v.number(),
    quantity: v.number(),
    category: v.string(),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .searchIndex("search", {
      searchField: "name",
      filterFields: ["userId"],
    }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
