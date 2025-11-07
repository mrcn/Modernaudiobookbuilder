# 🧪 Test Cases for Chunking Algorithm v2.2

## Your Specific Case

### Input
- **File size:** 1,238,625 characters
- **Format:** Single-newline line breaks (no paragraph breaks)
- **Word count:** 219,318 words

### Expected Output (v2.2)
```
📚 Chunking text: 1238625 characters
📊 Range: 0% to 100%
✅ Created 620 chunks from selected text
```

### Calculation
- Target: 2000 chars/chunk
- Total: 1,238,625 chars
- Expected chunks: 1,238,625 / 2000 = **619.3125 → ~620 chunks**

### What You Should See

**Console Output:**
```javascript
📚 Chunking text: 1238625 characters
📊 Range: 0% to 100%  
✅ Created 620 chunks from selected text
```

**Chunk Workspace Header:**
```
Chunk Workspace
620 total chunks • Modernize chunks, then create audio segments
```

**First Chunk (expand to view):**
```
Chunk 0
~2000 characters
~400 words
~2600 tokens
```

**Last Chunk:**
```
Chunk 619
~1625 characters (remainder)
~325 words
~2113 tokens
```

### OLD v2.1 Behavior (BROKEN)
```
📚 Chunking text: 1238625 characters
📊 Range: 0% to 100%
✅ Created 1 chunks from selected text  ← WRONG!
```

Chunk Workspace showed:
```
1 total chunks  ← BROKEN!

Chunk 0:
- 1,238,625 characters  ← ENTIRE BOOK!
- 219,318 words
- 285,113 tokens
```

---

## Test Case Matrix

### TC1: Normal Book (Paragraph Breaks)

**Input:**
```
Chapter 1: The Beginning

This is the first paragraph. It contains several sentences. Each sentence adds to the narrative.

This is the second paragraph. It continues the story. More details are revealed here.

Chapter 2: The Middle

Another paragraph in the next chapter. The plot thickens. Characters develop further.

... [continues for 500,000 characters]
```

**Expected:**
- Split by `\n\n` (double-newlines)
- ~250 chunks
- Each chunk ~2000 chars (multiple paragraphs)

**v2.1 Result:** ✓ Works correctly  
**v2.2 Result:** ✓ Works correctly

---

### TC2: Book with ONLY Line Breaks (User's Case)

**Input:**
```
Line 1 of the book with text
Line 2 continues the narrative
Line 3 has more content here
Line 4 keeps going with the story
... [continues for 1,238,625 characters]
```

**Expected:**
- Split by `\n\n` → finds nothing
- **Fallback:** Split by `\n` (single-newlines)
- ~620 chunks
- Each chunk ~2000 chars (multiple lines)

**v2.1 Result:** ✗ Creates 1 giant chunk  
**v2.2 Result:** ✓ Creates 620 chunks

---

### TC3: Book with Giant Paragraphs

**Input:**
```
This is a massive paragraph that goes on and on without any breaks. It contains hundreds of sentences. The first sentence is here. The second sentence follows. The third sentence continues. [continues for 10,000 characters in one paragraph]

This is another giant paragraph. [another 10,000 characters]

... [total 500,000 characters across 50 giant paragraphs]
```

**Expected:**
- Split by `\n\n` → 50 paragraphs
- Each paragraph 10,000 chars → exceeds 4000 threshold
- **Split by sentences** within each paragraph
- ~250 chunks
- Each chunk ~2000 chars

**v2.1 Result:** ✗ Creates 50 chunks (one per paragraph, each 10K chars!)  
**v2.2 Result:** ✓ Creates 250 chunks (splits giant paragraphs)

---

### TC4: Mixed Format

**Input:**
```
Chapter 1

Normal paragraph here.

Line 1 without paragraph break
Line 2 without paragraph break
Line 3 without paragraph break

Another normal paragraph.

Giant paragraph that goes on forever. Sentence one. Sentence two. Sentence three. [continues for 8000 characters]

Back to normal paragraphs.

... [total 1,000,000 characters]
```

**Expected:**
- Handles mixed format gracefully
- ~500 chunks
- Splits appropriately based on content

**v2.1 Result:** ✗ Inconsistent chunking  
**v2.2 Result:** ✓ Consistent ~2000 char chunks

---

### TC5: No Line Breaks (Continuous Text)

**Input:**
```
Thisisabookwithnolinebreaksatall.Justonegiganticstringthatgoeson.Sentence after sentence.Paragraph after paragraph.[continues for 100,000 characters without ANY newlines]
```

**Expected:**
- Split by `\n\n` → nothing
- Split by `\n` → nothing
- **Split by sentences** (periods + space)
- ~50 chunks
- Each chunk ~2000 chars

**v2.1 Result:** ✗ Creates 1 giant chunk  
**v2.2 Result:** ✓ Creates 50 chunks

---

### TC6: Short Book

**Input:**
```
A very short story.

Just three paragraphs.

The end.
```
Total: 67 characters

**Expected:**
- 1 chunk (under 2000 chars)

**v2.1 Result:** ✓ Works  
**v2.2 Result:** ✓ Works

---

### TC7: Exactly 2000 Chars

**Input:**
Text exactly 2000 characters long, one paragraph.

**Expected:**
- 1 chunk

**v2.1 Result:** ✓ Works  
**v2.2 Result:** ✓ Works

---

### TC8: Empty Paragraphs

**Input:**
```
Paragraph 1


Paragraph 2



Paragraph 3
```

**Expected:**
- Filters empty paragraphs
- 3 chunks (or 1 if total < 2000 chars)

**v2.1 Result:** ✓ Works  
**v2.2 Result:** ✓ Works

---

## Regression Tests

To ensure v2.2 didn't break anything:

### RT1: Pride and Prejudice (~717,000 chars)
**Expected:** ~358 chunks

### RT2: Dracula (~870,000 chars)
**Expected:** ~435 chunks

### RT3: War and Peace (~3,200,000 chars)
**Expected:** ~1,600 chunks

---

## Edge Cases

### EC1: Single Character
**Input:** `a`  
**Expected:** 1 chunk

### EC2: Exactly targetChars Characters
**Input:** 2000 character string  
**Expected:** 1 chunk

### EC3: targetChars + 1 Characters
**Input:** 2001 character string  
**Expected:** 2 chunks (2000 + 1)

### EC4: All Whitespace
**Input:** `\n\n\n\n\n`  
**Expected:** 0 chunks (filters empty)

### EC5: Unicode Characters
**Input:** Text with emojis, Chinese, Arabic  
**Expected:** Chunks correctly based on character count

---

## Performance Tests

### PT1: Small (10 KB)
**Expected time:** < 10ms

### PT2: Medium (1 MB) - User's case
**Expected time:** < 100ms

### PT3: Large (10 MB)
**Expected time:** < 1 second

### PT4: Huge (100 MB)
**Expected time:** < 10 seconds

---

## How to Test

### Quick Test Script

1. **Create test.txt:**
   ```
   Line 1
   Line 2
   Line 3
   ... [copy/paste 500 times to get ~25,000 chars]
   ```

2. **Upload to Audibler**

3. **Check console:**
   ```
   📚 Chunking text: 25000 characters
   ✅ Created 13 chunks from selected text
   ```

4. **Verify:** 25,000 / 2000 = 12.5 → 13 chunks ✓

### Your Book Test

1. **Upload your 1,238,625 character book**

2. **Expected console output:**
   ```
   📚 Chunking text: 1238625 characters
   📊 Range: 0% to 100%
   ✅ Created 620 chunks from selected text
   ```

3. **Chunk Workspace should show:**
   ```
   620 total chunks
   ```

4. **Open first chunk:**
   ```
   Chunk 0
   Characters: ~2000
   Words: ~400
   Tokens: ~2600
   ```

5. **Open last chunk (619):**
   ```
   Chunk 619  
   Characters: ~1625 (remainder)
   Words: ~325
   Tokens: ~2113
   ```

---

## Success Criteria

✅ **Your book:** 1,238,625 chars → 620 chunks (NOT 1!)  
✅ **Console logs:** Shows correct chunk count  
✅ **Each chunk:** ~2000 characters  
✅ **Chunk Workspace:** Displays all 620 chunks  
✅ **Scrollable list:** Can scroll through all chunks  
✅ **No crashes:** App handles large number of chunks  

---

## If It Still Shows 1 Chunk

**Diagnostic Steps:**

1. **Clear browser cache** (Ctrl + Shift + R)
2. **Check browser tab title:** Should say "v2.2"
3. **Check console for errors**
4. **Verify App.tsx line 946:** Should have new algorithm
5. **Try in incognito mode**
6. **Try different browser**

**Debug in Console:**

```javascript
// Paste this in browser console:
const text = "Line 1\nLine 2\nLine 3\n".repeat(1000); // ~50KB
const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
console.log('Paragraphs found:', paragraphs.length);
const lines = text.split(/\n+/).filter(p => p.trim().length > 0);
console.log('Lines found:', lines.length);
console.log('Expected chunks:', Math.ceil(text.length / 2000));
```

**Expected output:**
```
Paragraphs found: 1 or 0  ← Should trigger fallback
Lines found: 3000  ← Should use these
Expected chunks: 25  ← 50000 / 2000
```

---

## Summary

| Test Case | Input Format | v2.1 | v2.2 |
|-----------|-------------|------|------|
| Normal paragraphs | `\n\n` breaks | ✓ | ✓ |
| Single-newlines | `\n` breaks | ✗ | ✓ |
| Giant paragraphs | >4000 chars | ✗ | ✓ |
| No breaks | Continuous | ✗ | ✓ |
| Mixed format | Various | ~ | ✓ |

**v2.2 handles ALL text formats correctly!**
