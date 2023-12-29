import asyncio
import json
import time
import pathlib

from datetime import datetime, timedelta

from playhouse.shortcuts import model_to_dict

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code one directory up
# or add the `decky-loader/plugin` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky_plugin

import peewee


db_path = pathlib.Path('/home/gamer/.notifies')
db_path.mkdir(exist_ok=True, parents=True)

db = peewee.SqliteDatabase(db_path / 'data.db', pragmas={
    'journal_mode': 'wal',
    'cache_size': -1024 * 64})


class BaseModel(peewee.Model):

    class Meta:
        database = db


class Toast(BaseModel):

    title = peewee.TextField()
    body = peewee.TextField()
    duration = peewee.IntegerField()
    critical = peewee.BooleanField(default=True)
    to_notify = peewee.BooleanField(default=True)


Toast.create_table()

class Plugin:

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        decky_plugin.logger.info("Starting SDH-CustomNotifications")


    async def _unload(self):
        decky_plugin.logger.info('Dropping Toast table')
        Toast.update(to_notify=False).execute()

    async def get_toasts(self):
        decky_plugin.logger.info('Getting new toasts from data.db')

        def update_record(model):
            model.to_notify = False
            model.save()
            return model_to_dict(model, exclude=['id', 'to_notify'])

        query = Toast.select().where(
            Toast.to_notify == True
        )

        try:
            start = datetime.now()

            while datetime.now() - start < timedelta(seconds=3) or not query.count():
                decky_plugin.logger.info('Fetching toasts from data.db')
                await asyncio.sleep(0.4)

            models = [
                update_record(model)
                for model in query
            ]
            decky_plugin.logger.info(f'Got {len(models)} new toasts')
            return json.dumps(models)
        except Exception as error:
            decky_plugin.logger.error('Error while fetching toasts from db')
            decky_plugin.logger.exception(error)
            decky_plugin.logger.info(f'Got 0 new toasts')
            return '[]'
