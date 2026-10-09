type CatalogVisibility = "archived" | "draft" | "published";

const visibilityOptions: Array<{ value: CatalogVisibility; label: string; description: string }> = [
  { value: "archived", label: "Archived", description: "Retained privately" },
  { value: "draft", label: "Draft", description: "Hidden from the site" },
  { value: "published", label: "Published", description: "Visible on the site" }
];

export function CatalogVisibilitySwitch({ value }: { value: CatalogVisibility }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="font-bold">Visibility</legend>
      <div className="grid grid-cols-3 border border-items-blue">
        {visibilityOptions.map((option) => (
          <label key={option.value} className="cursor-pointer border-r border-items-blue last:border-r-0">
            <input className="peer sr-only" type="radio" name="visibility" value={option.value} defaultChecked={value === option.value} />
            <span className="grid min-h-16 content-center gap-0.5 px-3 py-2 text-center font-black transition-colors peer-checked:bg-items-blue peer-checked:text-items-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-items-blue">
              <span>{option.label}</span>
              <span className="text-[10px] font-medium leading-tight opacity-75">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
