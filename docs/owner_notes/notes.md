O1:In properties, I would maybe redo the Overview page. I went into it with the intention of verifying my mortgage and property info was correct. I was having trouble finding out where to do that. (Could probably add mortgage info in overview with a link to edit, just like property) I clicked mortgage, then saw mortgage details, clicked that, and right next to mortgage terms it says edit property inputs, so I clicked it since I thought maybe that'd be it, but it was editting the property instead of the mortgage even tho it was on the mortgage terms line. Then I scrolled down and found the edit button next to delete finally. That was a bit much to achieve that. *ADDRESSED* 

O2:Another note we should consider, partial property ownership causes some weird nuances. For example, it splits the equity as expected, but doesn't respect the settings option "Partial" for liability. In fact I think we should do a full sitewide audit and clarification of how we handle property ownership because it feels at times confusing and inconsistent. *ADDRESSED*

O3:On the modeling page, theres some inconsistencies. Net Sale Proceeds+Cash Flow, it doesnt state if thats by year 10 or not. So I'm not sure what thats referring to (can figure it out by context clues ig but we should maybe state it). Also does reinvesting cash flow math include stopping the reinvestment once loan is paid off? Also looks like 30 is the max years, is that intentional? It'd be nice to figure out what year we'll be cashflow positive as well, for some reason with my property using the following: "Baseline inputs: rent $2,195/mo, expenses $100/mo, debt service $2,648/mo, ownership 100.0%, cash invested $32,000. Baseline for % deltas uses the Base preset with no extra principal and no reinvestment, using the same ownership mode." it's showing when I hover over "Today" as "Annual cash flow 1802", i guess above it, it says next 12 months from today, but I'm confused on where thats coming from, I'm using the base preset. *ADDRESSED*

O4:On the mortgage page, it says my mortgage is not amortizing, in real life, my westgate bank says it ends in aug 2053, details in the app might be slightly off since my loan just changed escrow amounts, but it's based on real numbers. The graph on the mortgage page shows for Jun 2053, I am at a 2904 balance, which I presume puts me into August 2053 so maybe it is correct, but for some reason it still says not amortizing. I think one reason for this is while my loan began on jul 2023, the bank didn't have me start paying til august, so we should maybe leave some leeway there when it says "Not amortizing" and add a little helper that says "Estimate looks off?" and mention this sort of scenario as well as encouraging them to update their details of their mortgage. *ADDRESSED*



NEW NOTES UNREAD:

O5: keep running into this issue when I sign in or testing sign ups where it gets through the clerk thing (usually am using sign up with google) and it shoots me back to the public facing thing and I have to click go to dashboard which is annoying, I want it to bring me directly to dashboard.
→ *Tracked in tasks.md Batch 1: Fix post-auth redirect to dashboard (O5)*

O6: On Analyze Deal, In Investment Metrics, Monthly Cash Flow, Annual Cash Flow, next to Equity and NOI get wrapped to 3 lines, that looks unprofessional. We should probably fix that. Also under Ownership %, its clamped to the width of the above column, it's probably fine to let it span the whole width of the card
→ *Tracked in tasks.md Batch 6: Fix Analyze Deal Investment Metrics layout (O6)*

O7: When you click rent sensitivity or expense sensitivity in analyze deal, the color of the stress mode popup is really badly contrasted and hard to read
