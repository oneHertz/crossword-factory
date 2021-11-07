from django.db import models
from django.contrib.auth.models import User
from utils.helpers import random_key
import re

# Create your models here.
class Grid(models.Model):
    author = models.ForeignKey(
        User,
        related_name='crosswords_grids',
        on_delete=models.CASCADE
    )
    uid = models.CharField(
        max_length=12,
        default=random_key,
        editable=False,
        unique=True,
    )
    creation_date = models.DateTimeField(auto_now_add=True)
    modification_date = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=128)
    width = models.IntegerField()
    height = models.IntegerField()
    solution = models.TextField()
    definitions = models.JSONField()
    published = models.BooleanField(default=False)

    @property
    def grid(self):
        return re.sub(r'[a-z-]', '_', self.solution)

    class Meta:
        ordering = ['-creation_date']
        verbose_name = 'grid'
        verbose_name_plural = 'grids'