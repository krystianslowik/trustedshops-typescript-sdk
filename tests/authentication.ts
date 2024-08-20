import { TrustedShops } from "../src/TrustedShops";

async function main() {
  const clientId = "";
  const clientSecret = "";

  const myTrustedShop_pl = new TrustedShops();
  await myTrustedShop_pl.authenticate(clientId, clientSecret);

  console.log(myTrustedShop_pl.showToken());

  // get all reviews
  const reviews = await myTrustedShop_pl.Reviews?.getReviews("");

  // filter themm, to use only 5 stars one
  const filtered = await myTrustedShop_pl.Reviews?.filterReviews(reviews!, 5);

  // count filtered reviews
  console.log("Count:", filtered?.length);

  // show just Title and customer name
  for (const review of filtered!) {
    console.log(review.title);
    console.log("Name: ", review.customer.firstName ?? "No-name dude");
  }

  // sort reviews by date

  console.log(
    "Sorted: ",
    await myTrustedShop_pl.Reviews?.sortReviewsByDate(reviews!, "asc")
  );
}

main();
