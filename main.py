import os
import json
import discord
from discord.ext import commands
from dotenv import load_dotenv
from signup import send_signup_button
from leave import send_leave_button
#=======================================================
discord.Intents.default().members = True
bot = commands.Bot(command_prefix="!", intents=discord.Intents.default())

#=======================================================
@bot.event
async def on_ready():
    print(f'Bot 已上線 {bot.user}')
    channel_1 = bot.get_channel(自行更改第一個頻道ID) #簽到區
    channel_2 = bot.get_channel(自行更改第二個頻道ID) #請假區
    if channel_1 and channel_2:
        await send_signup_button(channel_1)
        await send_leave_button(channel_2)
    await bot.tree.sync() 
#=======================================================
user_data_path = "registered_students.json"
def load_users_data(file_path):
	if os.path.exists(file_path):
		with open(file_path, 'r') as file:
			return json.load(file)
	return {"students": []}  
#=======================================================
#列出已註冊名單的命令(Only管理員)
@bot.tree.command(name="list_registered", description="列出所有已註冊名單")
@commands.has_permissions(administrator=True)  #管理員此用指令(超好用)
async def list_registered(interaction: discord.Interaction):
    print("list_registered sent")  #Debug信息會印再terminal
    users_data = load_users_data(user_data_path)
    total_students = len(users_data["students"])
    registered_students = [student for student in users_data["students"] if student.get("registered")]
    registered = len(registered_students)
    
    registered_message = f"總共 {total_students} 人，其中 {registered} 人已註冊\n\n"
    if registered == 0:
        registered_message += "目前沒有已註冊的學生"
    else:
        for student in users_data["students"]:
            registered_status = "已註冊" if student.get("registered") else "未註冊"
            discord_mention = f"{student['discord_id']}" if "discord_id" in student else "無法找到 Discord ID"
            registered_message += f"學號: {student['id']} | 班級: {student['class']} | 姓名: {student['name']} | 狀態: {registered_status} | 註冊DC帳號: {discord_mention}\n"
    await interaction.response.send_message(registered_message, ephemeral=True)

#沒有權限的錯誤
@list_registered.error
async def list_registered_error(interaction: discord.Interaction, error):
    if isinstance(error, commands.MissingPermissions):
        await interaction.response.send_message("你沒有權限使用這個命令。", ephemeral=True)
#=======================================================
load_dotenv()

bot_token = os.environ['DISCORD_BOT_TOKEN']
bot.run(bot_token)
#=======================================================