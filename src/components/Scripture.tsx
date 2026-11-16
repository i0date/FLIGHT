// How the words of the Bible are set, wherever they appear: in the Scripture typeface, with LORD in small
// capitals as the King James Bible prints it.

export function Kjv({ text }: { text: string }) {
  return (
    <>
      {text.split(/(LORD)/).map((part, i) => (part === 'LORD' ? <span key={i} className="smallcaps">Lord</span> : part))}
    </>
  );
}

// A question with quotations in it: the quoted words are Scripture, so they are set as Scripture.
export function Quoted({ text }: { text: string }) {
  return (
    <>
      {text.split(/(“[^”]*”)/).map((part, i) =>
        part.startsWith('“') ? (
          <span key={i} className="scripture">
            <Kjv text={part} />
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
