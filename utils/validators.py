import re

from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_nice_slug(slug):
    if re.search('[^-a-zA-Z0-9_]', slug):
        raise ValidationError(_('Only alphanumeric characters, '
                                'hyphens and underscores are allowed.'))
    if len(slug) < 2:
        raise ValidationError(_('Too short. (min. 2 characters)'))
    elif len(slug) > 32:
        raise ValidationError(_('Too long. (max. 32 characters)'))
    if slug[0] in "_-":
        raise ValidationError(_('Must start with an alphanumeric character.'))
    if slug[-1] in "_-":
        raise ValidationError(_('Must end with an alphanumeric character.'))
    if '--' in slug or '__' in slug or '-_' in slug or '_-' in slug:
        raise ValidationError(_('Cannot include 2 non alphanumeric '
                                'character in a row.'))
    if slug.lower() in settings.SLUG_BLACKLIST:
        raise ValidationError(_('Forbidden word.'))


custom_username_validators = [validate_nice_slug, ]
