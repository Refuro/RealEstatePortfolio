# Agent tasks

Tasks you want the **builder** agent to do. The PM adds tasks here when you ask; you can say "have the builder complete the tasks in tasks.md" and the PM will run the builder with these tasks.

---

## Builder tasks

- [x] **Next.js middleware → proxy:** Migrate `app/middleware.ts` from the deprecated middleware convention to the new proxy convention. See [Next.js docs](https://nextjs.org/docs/messages/middleware-to-proxy). Dev/build currently show this deprecation warning; app works as-is until migrated.

- [x] **Fix important lint errors:** Fix TypeScript and ESLint errors in the app. Run `npm run check` from `app/` to verify. **Ignore** the Prisma `schema.prisma` linter warning about the datasource URL — it's required for Prisma 6.

- [x] **Standardize state field:** Store and validate US states as 2-letter abbreviations (e.g. TX, CA). Add a state dropdown to the property form with all US state abbreviations. Update validation in `lib/validations/property.ts` to accept only valid abbreviations.

- [x] **Property type and units:** When property type is single_family, units should always be 1. Hide or disable the units field for single_family; only show it for multi_family. Enforce units=1 in validation when propertyType is single_family.

- [x] **Mortgage section input text color:** Fix the mortgage form inputs so entered text and placeholder text are clearly visible (currently very light grey, hard to read). Ensure sufficient contrast for accessibility.

- [x] **Interest rate as percent:** Allow users to enter interest rate as percent (e.g. 6.25) instead of decimal (0.0625). Convert input to decimal when saving; display as percent when showing. Update form label/placeholder accordingly.

- [x] **Loan type enum:** Enforce loan type as a dropdown with common options (e.g. conventional, FHA, VA, USDA, jumbo, other). Update schema, validation, and mortgage form. Allow null/optional for existing data.

---

*When the builder completes a task, they check it off here and report back. Add new tasks below.*
