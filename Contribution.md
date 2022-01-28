## Git Commit Msg


- **Format of the commit message**

```
ci: add travis.yml
^--^  ^------------^
|     |
|     +-> Summary in present tense.
|
+-------> Type: build, ci, docs, feat, fix, perf, refactor, test
```

- **Type values**

    * **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
    * **ci**: Changes to our CI configuration files and scripts (examples: CircleCi, SauceLabs)
    * **docs**: Documentation only changes
    * **feat**: A new feature
    * **fix**: A bug fix
    * **perf**: A code change that improves performance
    * **refactor**: A code change that neither fixes a bug nor adds a feature
    * **test**: Adding missing tests or correcting existing tests


#### Inspired by [Angular's commit style](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format).
