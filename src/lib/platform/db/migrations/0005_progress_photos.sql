-- Progress photos. The image files live in the photo store under the photo's id.
CREATE TABLE progress_photo (
	id TEXT PRIMARY KEY NOT NULL,
	date TEXT NOT NULL,
	pose TEXT NOT NULL CHECK (pose IN ('front', 'side', 'back')),
	width INTEGER NOT NULL CHECK (width > 0),
	height INTEGER NOT NULL CHECK (height > 0)
) STRICT;
