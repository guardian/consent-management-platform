# Sourcepoint UI

Storing Custom CSS used for Sourcepoint CMP UI releases.

Make sure to update these files to reflect any changes made on sourcepoint: `https://analytics.sourcepoint.com/`

Sourcepoint's UI for messages does not have any version control.  Furthermore it is difficult to use and easy to lose work by refreshing or closing the interface without saving - or having someone overwrite all your changes by working on the same file concurrently.

A better way to ensure your change are not lost is to take a copy of the full CSS file by opening the CSS panel in Sourcepoint and with the cursor inside that, using cmd+a, cmd+c to take a copy of the CSS then paste it into a file in your feature branch.  You can then make your changes in VSCode then paste them into Sourcepoint's CSS panel for testing. This allows you to take advantage of committing your changes incrementally and rolling back if needed.

Ideally, in the longer term we hope to create a better way of testing locally before pushing the tested changes to Sourcepoint so that this repo becomes the source of truth rather than a (hopeful) reflection of it.
