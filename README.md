# Blog Content Guide

This guide explains how to add and manage content in your blog. Follow these instructions to create blog posts and author profiles.

## Quick Start

1. Create your blog post file in `content/posts/`
2. Add the required frontmatter at the top
3. Write your content in Markdown
4. Create an author profile in `content/authors/` if needed
5. Add images to `static/images/`

## Adding Blog Posts

Blog posts are stored in the `content/posts/` directory. Each post is a Markdown file with frontmatter at the top.

### File Naming

File names must be lowercase with hyphens separating words.

**Correct:**
- `my-first-post.md`
- `introduction-to-hugo.md`
- `summer-vacation-2024.md`

**Incorrect:**
- `My First Post.md` (spaces, not lowercase)
- `my_first_post.md` (underscores instead of hyphens)
- `MyFirstPost.md` (not lowercase)

### Required Frontmatter

Every blog post must start with frontmatter between `---` markers. Include these fields:

```yaml
---
title: Your Post Title
authors:
  - Author Name
tags:
  - tag1
  - tag2
date: 2024-12-11T14:46:25+01:00
image: /images/your-image.jpg
---
```

**Field Descriptions:**

- `title`: The title of your post (can include spaces and capitals)
- `authors`: List of author names (must match author profile names exactly)
- `tags`: List of tags for categorizing your post
- `date`: Publication date in ISO 8601 format (YYYY-MM-DDTHH:MM:SS+TZ:TZ)
- `image`: Path to header image (always starts with `/images/`)

### Date Format

Dates must follow the ISO 8601 format with timezone:

**Correct:**
```yaml
date: 2024-12-11T14:46:25+01:00
date: 2024-01-15T09:30:00+01:00
date: 2024-06-20T18:00:00+02:00
```

**Incorrect:**
```yaml
date: 12/11/2024
date: December 11, 2024
date: 2024-12-11
```

The format is: `YYYY-MM-DDTHH:MM:SS+HH:MM`
- Year-Month-Day
- T separator
- Hour:Minute:Second (24-hour format)
- Timezone offset

### Draft Posts

To create a draft post that will not be published, add the `draft` field:

```yaml
---
title: Work in Progress
draft: true
authors:
  - Your Name
tags:
  - draft
date: 2024-12-11T14:46:25+01:00
image: /images/placeholder.jpg
---
```

## Creating Author Profiles

Author profiles are stored in `content/authors/`. Each author needs a profile file before they can be listed as a post author.

### File Naming

Author profile file names should match the author's name in lowercase with hyphens.

**Example:**
- Author name: `Jan Novák`
- File name: `jan-novák.md`

### Author Profile Structure

```yaml
---
name: Full Name
description: Brief biography of the author. Can be multiple sentences.
  This field supports line breaks.
avatar: /images/author-photo.jpg
date: 2024-12-11T13:57:13+01:00
---
```

**Field Descriptions:**

- `name`: Full name as it will appear on posts (must match exactly in post frontmatter)
- `description`: Author biography or description
- `avatar`: Path to author photo (optional, starts with `/images/`)
- `date`: Profile creation date in ISO 8601 format

## Images

### Adding Images

1. Place image files in the `static/images/` directory
2. Reference them in your post or author profile with `/images/filename.ext`

**Supported formats:**
- `.jpg`, `.jpeg`
- `.png`
- `.webp`

### Image References

**In blog posts:**
```yaml
image: /images/header-photo.jpg
```

**In author profiles:**
```yaml
avatar: /images/author-name.jpg
```

**In post content:**
```markdown
![Alt text](/images/inline-photo.jpg)
```

## Common Mistakes

### ✓ Correct vs ✗ Incorrect

**File Names:**

✓ `my-blog-post.md`  
✗ `My Blog Post.md` (contains spaces)

✓ `summer-vacation-2024.md`  
✗ `summer_vacation_2024.md` (uses underscores)

✓ `introduction-to-hugo.md`  
✗ `IntroductionToHugo.md` (not lowercase)

**Author Names:**

✓ Match exactly:
```yaml
# In author profile (petr-novák.md):
name: Petr Novák

# In blog post:
authors:
  - Petr Novák
```

✗ Mismatch causes broken links:
```yaml
# In author profile:
name: Petr Novák

# In blog post:
authors:
  - Petr Novak  # Missing diacritics
```

**Image Paths:**

✓ `image: /images/photo.jpg` (starts with `/images/`)  
✗ `image: images/photo.jpg` (missing leading slash)

✗ `image: /static/images/photo.jpg` (includes 'static' in path)

**Quotes in Frontmatter:**

✓ Use straight quotes:
```yaml
title: My "awesome" post
```

✗ Smart quotes break parsing:
```yaml
title: My "awesome" post
```

**Date Format:**

✓ `date: 2024-12-11T14:46:25+01:00`  
✗ `date: 12/11/2024`  
✗ `date: December 11, 2024`

**Missing Author Profile:**

✗ Post references author without profile:
```yaml
# Blog post:
authors:
  - John Doe  # No john-doe.md exists in content/authors/
```

This will cause the post to display incorrectly. Always create the author profile first.

**Tags Format:**

✓ Use list format (consistent with existing posts):
```yaml
tags:
  - general
  - tutorial
```

## Post Content

After the frontmatter, write your post content in Markdown:

```markdown
---
title: My Post
authors:
  - Author Name
tags:
  - general
date: 2024-12-11T14:46:25+01:00
image: /images/header.jpg
---

# Main Heading

Your post content goes here. Use standard Markdown formatting:

- **Bold text**
- *Italic text*
- [Links](https://example.com)
- Lists and more

## Subheadings

Add more sections as needed.
```

## Checklist for New Posts

Before publishing a post, verify:

- [ ] File name is lowercase with hyphens
- [ ] Frontmatter includes all required fields (title, authors, tags, date, image)
- [ ] Date is in ISO 8601 format
- [ ] Author profile exists in `content/authors/`
- [ ] Author name matches profile exactly
- [ ] Image file exists in `static/images/`
- [ ] Image path starts with `/images/`
- [ ] No smart quotes in frontmatter
- [ ] Tags use list format (not inline)

## Need Help?

If your post is not displaying correctly:

1. Check that the author profile file exists
2. Verify author name matches exactly (including diacritics)
3. Confirm image path starts with `/images/`
4. Validate date format follows ISO 8601
5. Look for smart quotes in frontmatter and replace with straight quotes
6. Ensure file name is lowercase with hyphens
