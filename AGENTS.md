<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Data access goes through src/lib/api.ts: calls the Java backend at VITE_API_URL (REST /assets, /departments, /employees, /loans, /locations, /maintenances), falling back to localStorage demo data when unset — lets the UI run without the backend.
- Module fields/forms/tables are declared in src/lib/resources.ts and rendered by the generic ResourcePage — add a field there, not per page.
